import { expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    background: [] as Array<() => Promise<void>>,
    findTrail: vi.fn(),
    setting: vi.fn(),
    generate: vi.fn(async (..._args: string[]) => 'https://example.com/image.png'),
    upload: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
}));
vi.mock('next/server', async (original) => ({
    ...(await original<typeof import('next/server')>()),
    after: (task: () => Promise<void>) => mocks.background.push(task),
}));

vi.mock('@/lib/db', () => ({
    db: {
        platform_setting: { findUnique: mocks.setting },
        trail: {
            findFirst: mocks.findTrail,
            update: mocks.update,
            updateMany: mocks.updateMany,
        },
        user_experiments: {
            findFirst: async () => ({ id: 1, engine_id: 1, experiment_id: '1' }),
            updateMany: vi.fn(),
        },
        experiment: { findFirst: async () => ({}) },
        engine: { findFirst: async () => ({}) },
        experiment_steps: { findFirst: async () => ({ content: { pic_mode: true } }) },
    },
}));
vi.mock('@/lib/upload.js', () => ({ uploadFile: mocks.upload }));
vi.mock('@/lib/session', () => ({ getCurrentUser: async () => null }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('@/lib/generate', () => ({ generateImage: mocks.generate }));
vi.mock('@/lib/prompt-preprocess', () => ({
    assemblePrompt: () => '内容：测试',
    updateContextSummary: async () => '测试',
}));

import { POST } from '../app/api/generate/route';

it.each([
    { configured: null, expected: 512, uploadSucceeds: true },
    { configured: { image_size: 768 }, expected: 768, uploadSucceeds: false },
    { configured: { image_size: 1024 }, expected: 1024, uploadSucceeds: true },
])('返回临时 URL 后异步归档，尺寸 $expected', async ({ configured, expected, uploadSucceeds }) => {
    vi.clearAllMocks();
    mocks.findTrail.mockResolvedValue({ prompt: '测试', state: 'GENERATING' });
    mocks.updateMany.mockResolvedValue({ count: 1 });
    mocks.background.length = 0;
    mocks.setting.mockResolvedValue(configured);
    mocks.upload.mockResolvedValue(uploadSucceeds ? 'https://example.com/archive.png' : null);
    vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response('image'))
    );
    try {
        const response = await POST(
            new Request('http://localhost/api/generate', {
                method: 'POST',
                body: JSON.stringify({ id: 'test', experimentId: 'test', part: 1 }),
            })
        );
        const temporary = 'https://example.com/image.png';
        expect(await response.json()).toMatchObject({ url: temporary });
        expect(mocks.generate).toHaveBeenCalledWith('内容：测试', `${expected}x${expected}`);
        expect(mocks.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    image_url: temporary,
                    state: 'SUCCESS',
                    archive_retry_at: expect.any(Date),
                }),
            })
        );
        expect(fetch).not.toHaveBeenCalled();
        await Promise.all(mocks.background.map((task) => task()));
        expect(mocks.upload).toHaveBeenCalledOnce();
        if (uploadSucceeds) {
            expect(mocks.updateMany).toHaveBeenCalledWith({
                where: { nano_id: 'test', image_url: temporary },
                data: { image_url: 'https://example.com/archive.png', archive_retry_at: null },
            });
        } else {
            expect(mocks.updateMany).toHaveBeenCalledTimes(1);
        }
    } finally {
        vi.unstubAllGlobals();
    }
});

it('并发生图和成功响应丢失后重试只调用一次提供方', async () => {
    vi.clearAllMocks();
    const row = { prompt: '测试', state: 'GENERATING', request_id: null };
    mocks.findTrail.mockImplementation(async () => ({ ...row }));
    mocks.updateMany.mockImplementation(async ({ where, data }) => {
        expect(where).toEqual({ nano_id: 'test', state: 'GENERATING', request_id: null });
        if (row.request_id !== null) return { count: 0 };
        Object.assign(row, data);
        return { count: 1 };
    });
    mocks.update.mockImplementation(async ({ data }) => Object.assign(row, data));
    let finish!: (url: string) => void;
    mocks.generate.mockImplementationOnce(
        () =>
            new Promise((resolve) => {
                finish = resolve;
            })
    );
    const submit = () =>
        POST(
            new Request('http://localhost/api/generate', {
                method: 'POST',
                body: JSON.stringify({ id: 'test', experimentId: 'test', part: 1 }),
            })
        );
    const first = submit();
    const concurrent = submit();
    expect((await Promise.race([first, concurrent])).status).toBe(202);
    finish('https://example.com/result.png');
    await Promise.all([first, concurrent]); // 模拟客户端没有收到成功响应
    expect(await (await submit()).json()).toMatchObject({ url: 'https://example.com/result.png' });
    expect(mocks.generate).toHaveBeenCalledOnce();
});
