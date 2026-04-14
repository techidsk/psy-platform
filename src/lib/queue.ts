import Queue from 'bull';

let _queue: Queue.Queue | null = null;

export function getDownloadQueue(): Queue.Queue {
    if (!_queue) {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        _queue = new Queue('download-queue', redisUrl);
    }
    return _queue;
}

export default getDownloadQueue;
