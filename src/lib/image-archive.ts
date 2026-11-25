import { createHash } from 'node:crypto';
import { db } from './db';
import { logger } from './logger';
import { uploadFile } from './upload.js';

export async function archiveImage(id: string, url: string) {
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
        if (!response.ok) throw new Error('下载失败');
        const bytes = Buffer.from(await response.arrayBuffer());
        if (!bytes.length) throw new Error('图片为空');
        const version = createHash('sha256').update(url).digest('hex').slice(0, 16);
        const archived = await uploadFile(bytes, `trail/${id}-${version}.png`);
        if (!archived) throw new Error('上传失败');
        await db.trail.updateMany({
            where: { nano_id: id, image_url: url },
            data: { image_url: archived, archive_retry_at: null },
        });
    } catch {
        logger.warn({ id }, '图片转存失败，保留临时地址并等待重试');
    }
}

export async function retryImageArchives() {
    const trails = await db.trail.findMany({
        where: { archive_retry_at: { lte: new Date() } },
        orderBy: { archive_retry_at: 'asc' },
        select: { nano_id: true, image_url: true, archive_retry_at: true },
        take: 10,
    });
    for (const trail of trails) {
        if (!trail.nano_id || !trail.image_url) continue;
        const claim = await db.trail.updateMany({
            where: trail,
            data: { archive_retry_at: new Date(Date.now() + 15 * 60000) },
        });
        if (claim.count) await archiveImage(trail.nano_id, trail.image_url);
    }
}
