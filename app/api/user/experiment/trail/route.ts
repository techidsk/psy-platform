import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

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
        orderBy: [
            {
                part: 'asc',
            },
            {
                id: 'asc',
            },
        ],
        select: {
            prompt: true,
            image_url: true,
            part: true,
            nano_id: true,
        },
    });

    const experimentSteps = await db.$queryRaw<any[]>`
        SELECT step_name, CAST(num AS SIGNED) as part
        FROM (
            SELECT es.*, ROW_NUMBER() OVER (ORDER BY es.order)  as num
                FROM user_experiments ue
                LEFT JOIN experiment_steps es on es.experiment_id = ue.experiment_id
                WHERE ue.nano_id = ${userExperimentNanoId}
                GROUP BY es.id
            ) AS subquery
        WHERE type = 4
    `;

    const convertedExperimentSteps = experimentSteps.map((step) => ({
        ...step,
        part: Number(step.part),
    }));

    return NextResponse.json({
        data: {
            images: images,
            experimentSteps: convertedExperimentSteps,
        },
    });
}
