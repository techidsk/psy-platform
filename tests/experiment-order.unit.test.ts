import { expect, it, vi } from 'vitest';
import { POST as bind } from '../app/api/project/group/experiment/bind/route';
import { POST as copy } from '../app/api/experiment/copy/route';
import { db } from '@/lib/db';

vi.mock('@/lib/session', () => ({ getCurrentUser: () => ({ role: 'ADMIN' }) }));
vi.mock('@/lib/nano-id', () => ({ getId: () => crypto.randomUUID() }));
vi.mock('@/lib/db', () => ({
    db: {
        project_group_experiments: { findFirst: vi.fn(), createMany: vi.fn() },
        experiment: { findUnique: vi.fn(), create: vi.fn() },
        experiment_steps: { findMany: vi.fn(), createMany: vi.fn() },
    },
}));

function post(body: unknown) {
    return new Request('http://localhost', { method: 'POST', body: JSON.stringify(body) });
}

it('appends after positions 0 and 1 even when experiment IDs are descending', async () => {
    const rows = [
        { id: 1, project_group_id: 7, experiment_id: 20, experiment_index: 0 },
        { id: 2, project_group_id: 7, experiment_id: 10, experiment_index: 1 },
    ];
    vi.mocked(db.project_group_experiments.findFirst).mockResolvedValue(rows[1]);
    const response = await bind(post({ projectGroupId: '7', experimentIds: [30, 15] }));
    expect(response.status).toBe(200);
    expect(db.project_group_experiments.findFirst).toHaveBeenCalledWith({
        where: { project_group_id: 7 },
        orderBy: { experiment_index: 'desc' },
    });
    expect(db.project_group_experiments.createMany).toHaveBeenCalledWith({
        data: [
            { project_group_id: 7, experiment_id: 30, experiment_index: 2 },
            { project_group_id: 7, experiment_id: 15, experiment_index: 3 },
        ],
    });
});

it('copies steps in their edited order', async () => {
    const source = {
        id: 5,
        creator: null,
        experiment_name: '模板',
        create_time: null,
        available: 1,
        description: null,
        nano_id: null,
        engine_id: null,
        intro: null,
        engine_ids: [],
        lock: 0,
        intent_profile: null,
    };
    vi.mocked(db.experiment.findUnique).mockResolvedValue(source);
    vi.mocked(db.experiment.create).mockResolvedValue({ ...source, id: 6 });
    const common = {
        experiment_id: 5,
        type: 1,
        title: '',
        content: null,
        random_id: null,
        nano_id: null,
    };
    vi.mocked(db.experiment_steps.findMany).mockResolvedValue([
        { ...common, id: 2, order: 1, step_name: 'B' },
        { ...common, id: 1, order: 2, step_name: 'A' },
    ]);
    expect((await copy(post({ id: 5 }))).status).toBe(200);
    expect(db.experiment_steps.findMany).toHaveBeenCalledWith({
        where: { experiment_id: 5 },
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });
    expect(db.experiment_steps.createMany).toHaveBeenCalledWith({
        data: [
            expect.objectContaining({ experiment_id: 6, order: 1, step_name: 'B' }),
            expect.objectContaining({ experiment_id: 6, order: 2, step_name: 'A' }),
        ],
    });
});
