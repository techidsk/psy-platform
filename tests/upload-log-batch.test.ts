import { afterEach, expect, it, vi } from 'vitest';
import store from 'store2';
import { uploadLogBatch } from '../src/lib/upload-log-batch';

const key = 'userLogs_test';
afterEach(() => {
    store.remove(key);
    vi.unstubAllGlobals();
});

it.each(['network', 'http', 'invalid', 'success'])('日志上传结果 %s', async (result) => {
    store(key, JSON.stringify(['old']));
    let finish!: (response: Response) => void;
    let fail!: (error: Error) => void;
    const send = vi.fn(
        () =>
            new Promise<Response>((resolve, reject) => {
                finish = resolve;
                fail = reject;
            })
    );
    vi.stubGlobal('fetch', send);
    const pending = uploadLogBatch(key);
    store(key, JSON.stringify(['old', 'new']));
    await uploadLogBatch(key);
    expect(send).toHaveBeenCalledOnce();
    if (result === 'network') fail(new Error('network'));
    else
        finish(
            Response.json(
                { msg: result === 'invalid' ? '失败' : '添加成功' },
                {
                    status: result === 'http' ? 500 : 200,
                }
            )
        );
    if (result === 'network') await expect(pending).rejects.toThrow('network');
    else await pending;
    expect(JSON.parse(store(key))).toEqual(result === 'success' ? ['new'] : ['old', 'new']);
});
