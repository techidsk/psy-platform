// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * /api/experiment/finish
 * @returns
 */
export async function POST(request: Request) {
    const data = await request.json();

    // 判断用户是否有输入内容
    const trails = await db.trail.findMany({
        where: { user_experiment_id: data.id },
    });

    if (trails.length === 0) {
        logger.warn(`[实验${data.id}] 未完成，已经删除`);
        return NextResponse.json({ msg: '用户未输入内容，实验失败' }, { status: 400 });
    }

    logger.info(`[实验${data.id}] 已经完成`);

    logger.info(`nano_id: ${data.id}, part: ${data.part}`);

    const userExperiment = await db.user_experiments.updateMany({
        where: {
            nano_id: data.id,
            part: data.part,
        },
        data: {
            finish_time: new Date(),
            state: 'FINISHED',
        },
    });

    return NextResponse.json({ msg: '已完成写作' });
}
