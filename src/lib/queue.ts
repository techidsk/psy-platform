import Queue from 'bull';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const downloadQueue = new Queue('download-queue', redisUrl);

export default downloadQueue;
