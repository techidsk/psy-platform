import Queue from 'bull';

let _queue: Queue.Queue | null = null;

function getQueue(): Queue.Queue {
    if (!_queue) {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        _queue = new Queue('download-queue', redisUrl);
    }
    return _queue;
}

export const downloadQueue = new Proxy({} as Queue.Queue, {
    get(_target, prop) {
        return (getQueue() as any)[prop];
    },
});

export default downloadQueue;
