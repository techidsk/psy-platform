import store from 'store2';

const uploading = new Set<string>();

export async function uploadLogBatch(key: string) {
    if (uploading.has(key)) return;
    uploading.add(key);
    try {
        const batch: unknown[] = JSON.parse(store(key) || '[]');
        if (!batch.length) return;
        const response = await fetch('/api/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batch),
        });
        if (!response.ok || (await response.json()).msg !== '添加成功') return;

        const current: unknown[] = JSON.parse(store(key) || '[]');
        if (JSON.stringify(current.slice(0, batch.length)) !== JSON.stringify(batch)) return;
        const remaining = current.slice(batch.length);
        if (remaining.length) store(key, JSON.stringify(remaining));
        else store.remove(key);
    } finally {
        uploading.delete(key);
    }
}
