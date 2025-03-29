import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * /api/trail/pending
 * 获取处于GENERATING状态的trail
 * @returns
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const experimentNanoId = searchParams.get('nano_id');

        if (!experimentNanoId) {
            return NextResponse.json(
                {
                    msg: '缺少实验ID参数',
                    trails: [],
                },
                { status: 400 }
            );
        }

        const trails = await db.trail.findMany({
            where: {
                user_experiment_id: experimentNanoId,
                state: 'GENERATING',
            },
            select: {
                nano_id: true,
                request_id: true,
                prompt: true,
                create_time: true,
            },
        });

        return NextResponse.json({
            msg: '获取成功',
            trails: trails,
        });
    } catch (error) {
        logger.error('获取待处理生成任务失败:', error);
        return NextResponse.json(
            {
                msg: '获取待处理生成任务失败',
                trails: [],
            },
            { status: 500 }
        );
    }
}
