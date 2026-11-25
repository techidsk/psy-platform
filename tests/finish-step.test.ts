import { expect, it, vi, afterEach } from 'vitest';
import { POST } from '../app/api/experiment/finish/route';
import { useExperimentState } from '@/state/_experiment_atoms';
import { CountDown } from '@/components/countdown';

const mocks = vi.hoisted(() => ({
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    updateMany: vi.fn(),
    effects: [] as Array<() => void>,
    push: vi.fn(),
}));
vi.mock('@/lib/db', () => ({
    db: {
        user_experiments: { findUnique: mocks.findUnique, updateMany: mocks.updateMany },
        trail: { findFirst: mocks.findFirst },
    },
}));
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn() } }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('react', async (original) => ({
    ...(await original<typeof import('react')>()),
    useState: () => [null, vi.fn()],
    useEffect: (effect: () => void) => {
        mocks.effects.push(effect);
    },
}));

afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
});
const submit = (part: number) =>
    POST(
        new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ id: 'sample', part }),
        })
    );

it('requires a trail from this participation and part, preserves empty step and finishes once', async () => {
    let state = 'IN_EXPERIMENT';
    let trailPart = 1;
    mocks.findUnique.mockImplementation(({ where }) => {
        expect(where.nano_id_part).toEqual({ nano_id: 'sample', part: 2 });
        return Promise.resolve({ state });
    });
    mocks.findFirst.mockImplementation(({ where }) => {
        expect(where).toEqual({ user_experiment_id: 'sample', part: 2 });
        return Promise.resolve(where.part === trailPart ? { id: 1 } : null);
    });
    let writes = 0;
    mocks.updateMany.mockImplementation(({ where, data }) => {
        expect(where).toEqual({ nano_id: 'sample', part: 2, state: 'IN_EXPERIMENT' });
        if (state !== where.state) return Promise.resolve({ count: 0 });
        state = data.state;
        writes++;
        return Promise.resolve({ count: 1 });
    });
    expect((await submit(2)).status).toBe(400);
    trailPart = 2;
    const results = await Promise.all([submit(2), submit(2)]);
    expect(results.map((r) => r.status)).toEqual([200, 200]);
    expect(
        (await Promise.all(results.map((r) => r.json()))).filter((r) => r.duplicate)
    ).toHaveLength(1);
    expect(writes).toBe(1);
});

it('deduplicates in-flight requests per step and releases on network and HTTP failures', async () => {
    let reject!: (error: Error) => void;
    const fetch = vi
        .fn()
        .mockImplementationOnce(
            () =>
                new Promise((_, r) => {
                    reject = r;
                })
        )
        .mockResolvedValueOnce(new Response())
        .mockResolvedValueOnce(new Response('{}', { status: 400 }))
        .mockResolvedValueOnce(new Response());
    vi.stubGlobal('fetch', fetch);
    const { finishStep } = useExperimentState.getState();
    const pending = finishStep('sample', 1);
    expect(await finishStep('sample', 1)).toBe(false);
    expect(await finishStep('sample', 2)).toBe(true);
    reject(new Error('offline'));
    await expect(pending).rejects.toThrow();
    await expect(finishStep('sample', 1)).rejects.toThrow();
    expect(await finishStep('sample', 1)).toBe(true);
});

it('only warns on beforeunload and submits on expiry', async () => {
    vi.useFakeTimers();
    const win = new EventTarget();
    vi.stubGlobal('window', win);
    const fetch = vi.fn().mockResolvedValue(new Response());
    vi.stubGlobal('fetch', fetch);
    CountDown({
        nanoId: 'sample',
        part: 2,
        callbackUrl: '/next',
        start: Math.floor(Date.now() / 1000) - 58,
        limit: 1,
    });
    const cleanups = mocks.effects.map((effect) => effect()) as unknown as Array<() => void>;
    // Simulate the browser invoking beforeunload, including cancelled navigation.
    const event = new Event('beforeunload', { cancelable: true });
    Object.defineProperty(event, 'returnValue', { writable: true, value: '' });
    win.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(3000);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(mocks.push).toHaveBeenCalledWith('/next');
    cleanups.forEach((cleanup) => cleanup());
});
