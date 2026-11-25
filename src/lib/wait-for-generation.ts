export async function waitForGeneration(send: () => Promise<Response>, mounted: () => boolean) {
    let attempts = 0;
    let failures = 0;
    while (mounted()) {
        let response: Response | undefined;
        try {
            response = await send();
            if (response.ok && response.status !== 202) return await response.json();
        } catch {
            response = undefined;
        }
        if (response && response.status !== 202 && response.status < 500) {
            throw new Error((await response.json()).msg || '生成任务已结束');
        }
        if (response?.status === 202) failures = 0;
        else if (++failures > 3) throw new Error('无法确认生成状态，请查看历史记录');
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** Math.min(attempts++, 3)));
    }
}
