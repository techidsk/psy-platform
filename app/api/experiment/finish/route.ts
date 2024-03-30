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
        // TODO 删除本次实验
        // await db.user_experiments.delete({
        //     where: {
        //         nano_id: data.id,
        //     },
        // });
        logger.info(`[实验${data.id}] 未完成，已经删除`);
        return NextResponse.json({ msg: '已成功清理实验' });
    }

    logger.info(`[实验${data.id}] 已经完成`);
    const userExperiment = await db.user_experiments.update({
        where: {
            nano_id: data.id,
        },
        data: {
            finish_time: new Date(),
        },
    });
    logger.info(
        `更新[用户${userExperiment.user_id}] 项目分组[${userExperiment.project_group_id}]完成写作数量`
    );
    await db.user_group.update({
        where: {
            user_id_project_group_id: {
                user_id: userExperiment.user_id || 0,
                project_group_id: userExperiment.project_group_id || 0,
            },
        },
        data: {
            project_experiment_times: {
                increment: 1,
            },
        },
    });

    return NextResponse.json({ msg: '已完成写作' });
}
