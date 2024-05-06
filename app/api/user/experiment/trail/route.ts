import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { getId } from '@/lib/nano-id';
import { getUserGroupExperiments } from '@/lib/user_experiment';
import { logger } from '@/lib/logger';

/**
 * /api/user/experiment/trail
 * 获取用户实验记录详情
 * @returns 返回 userExperimentNanoId
 */
export async function POST(request: Request) {
    const data = await request.json();
    const { userExperimentNanoId, userId } = data;
    const images = await db.trail.findMany({
        where: {
            user_experiment_id: userExperimentNanoId,
            image_url: {
                not: null,
            },
        },
        orderBy: {
            part: 'asc',
            create_time: 'asc',
        },
    });

    return NextResponse.json({ data: images });
}
