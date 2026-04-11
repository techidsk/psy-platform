import { NextResponse } from 'next/server';
import { runExperimentJobs } from '@/lib/jobs';
import { logger } from '@/lib/logger';

/**
 * 更新实验状态
 * /api/jobs
 * @returns
 */
export async function GET(request: Request) {
    try {
        await runExperimentJobs();
        return NextResponse.json({ status: 'success' });
    } catch (error) {
        logger.error('更新实验状态失败:', error);
        return NextResponse.json({ status: 'error', message: error }, { status: 500 });
    }
}
