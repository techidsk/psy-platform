import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
    lock: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
}));
vi.mock('@/lib/experiment-participant', () => ({ getParticipantId: async () => 7 }));
vi.mock('@/lib/db', () => ({
    db: {
        $transaction: (run: (tx: unknown) => unknown) =>
            run({
                $queryRaw: mocks.lock,
                trail: { count: mocks.count, create: mocks.create },
            }),
    },
}));
import { POST } from '../app/api/trail/route';
const submit = () =>
    POST(
        new Request('http://localhost/api/trail', {
            method: 'POST',
            body: JSON.stringify({
                nano_id: 'exp',
                promptNanoId: 'text',
                prompt: '实验写作内容',
                part: 1,
            }),
        })
    );
beforeEach(() => {
    vi.clearAllMocks();
    mocks.lock.mockResolvedValue([{ part: 1 }]);
});
it('同一实验已有两条进行中记录时拒绝创建', async () => {
    mocks.count.mockResolvedValue(2);
    expect((await submit()).status).toBe(429);
    expect(mocks.count).toHaveBeenCalledWith({
        where: {
            user_experiment_id: 'exp',
            user_id: 7,
            state: 'GENERATING',
        },
    });
    expect(mocks.create).not.toHaveBeenCalled();
});
it('一条进行中记录时可以创建第二条', async () => {
    mocks.count.mockResolvedValue(1);
    expect((await submit()).status).toBe(200);
    expect(mocks.create).toHaveBeenCalledOnce();
});
it('步骤不属于当前参与者时拒绝创建', async () => {
    mocks.lock.mockResolvedValue([]);
    expect((await submit()).status).toBe(404);
    expect(mocks.create).not.toHaveBeenCalled();
});
