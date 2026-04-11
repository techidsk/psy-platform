export async function register() {
    // 仅在 Node.js 运行时中注册定时任务（避免 Edge Runtime 报错）
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const cron = await import('node-cron');
        const { runExperimentJobs } = await import('@/lib/jobs');
        const { logger } = await import('@/lib/logger');

        // 每分钟执行一次实验状态清理任务
        cron.default.schedule('* * * * *', async () => {
            try {
                await runExperimentJobs();
            } catch (error) {
                logger.error('定时实验状态清理任务执行失败:', error);
            }
        });

        logger.info('已注册实验状态清理定时任务（每分钟执行）');
    }
}
