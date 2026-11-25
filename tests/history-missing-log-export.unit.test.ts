import JSZip from 'jszip';
import { expect, it, vi } from 'vitest';
import { getUserExperimentHistory } from '@/lib/user_experment_history';

const queries = vi.hoisted(() => ({ trail: vi.fn(), logs: vi.fn() }));
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }));
vi.mock('@/lib/db', () => ({
    db: {
        user_experiments: { findFirst: async () => ({ user_id: 1 }) },
        user: { findFirst: async () => ({}) },
        trail: { findMany: queries.trail },
        trail_logger: { findMany: queries.logs },
    },
}));

it.each([
    { experiment: true, input: true, prompt: '正文', image: '', log: false, files: ['ji.csv'] },
    {
        experiment: true,
        input: false,
        prompt: '',
        image: 'image.png',
        log: false,
        files: ['ji.csv'],
    },
    { experiment: true, input: true, prompt: '', image: '', log: true, files: ['hu.csv'] },
    {
        experiment: true,
        input: true,
        prompt: '正文',
        image: '',
        log: true,
        files: ['hu.csv', 'ji.csv'],
    },
    { experiment: false, input: true, prompt: '正文', image: '', log: false, files: [] },
    { experiment: true, input: false, prompt: '', image: '', log: true, files: [] },
])('exports selected records for %j', async ({ experiment, input, prompt, image, log, files }) => {
    vi.clearAllMocks();
    queries.trail.mockResolvedValue([{ prompt, image_url: image }]);
    queries.logs.mockResolvedValue(log ? [{ input: '输入', images: [], timestamp: 1 }] : []);

    const response = await getUserExperimentHistory('sample', '1', experiment, input);
    expect(queries.trail).toHaveBeenCalledTimes(Number(experiment));
    expect(queries.logs).toHaveBeenCalledTimes(Number(input));
    if (!files.length) {
        expect(response.status).toBe(404);
        expect(await response.json()).toHaveProperty('msg', '所选导出项没有可导出的记录');
        return;
    }

    expect(response.status).toBe(200);
    const zip = await JSZip.loadAsync(await response.arrayBuffer());
    expect(Object.keys(zip.files).sort()).toEqual(files);
    if (files.includes('ji.csv')) {
        expect(await zip.file('ji.csv')!.async('string')).toContain(prompt || image);
    }
    if (files.includes('hu.csv')) {
        expect(await zip.file('hu.csv')!.async('string')).toContain('输入');
    }
});
