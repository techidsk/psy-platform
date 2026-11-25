import { afterEach, expect, it, vi } from 'vitest';
import { waitForGeneration } from '../src/lib/wait-for-generation';

afterEach(() => vi.useRealTimers());

it('多次 202 后继续等待同一任务，直至成功', async () => {
    vi.useFakeTimers();
    const responses = [202, 202, 202, 202, 200];
    const send = vi.fn(async () => Response.json({ url: 'done' }, { status: responses.shift() }));
    const result = waitForGeneration(send, () => true);
    await vi.runAllTimersAsync();
    expect(await result).toEqual({ url: 'done' });
    expect(send).toHaveBeenCalledTimes(5);
});

it.each(['202', '503', 'network'])('组件在 %s 重试等待期间卸载', async (reason) => {
    vi.useFakeTimers();
    let mounted = true;
    const send = vi.fn(async () => {
        if (reason === 'network') throw new Error('network');
        return new Response(null, { status: Number(reason) });
    });
    const result = waitForGeneration(send, () => mounted);
    await vi.advanceTimersByTimeAsync(10);
    mounted = false;
    await vi.runAllTimersAsync();
    expect(await result).toBeUndefined();
    expect(send).toHaveBeenCalledOnce();
});
