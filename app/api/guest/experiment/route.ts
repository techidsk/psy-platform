import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * /api/guest/experiment
 * 创建用户新实验
 * @returns
 */
export async function POST(request: Request) {
    const data = await request.json();
    const userNanoId = data['user_id'];
    const user = await db.user.findFirst({
        where: {
            nano_id: userNanoId,
        },
    });
    if (!user) {
        return NextResponse.json({ msg: '用户不存在' });
    }

    const experiment = await db.experiment.findFirst({
        where: {
            nano_id: data['experimentNanoId'],
        },
    });
    if (experiment) {
        const userExperiment = await db.user_experiments.create({
            data: {
                ...data,
                user_id: user.id,
            },
        });
        return NextResponse.json({
            msg: '发布成功',
            data: {
                user_experiment_id: userExperiment.nano_id,
            },
        });
    }
    return NextResponse.json({ msg: '发布成功' });
}
