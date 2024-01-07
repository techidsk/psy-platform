import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';

/**
 * /api/trail
 * 用户测试引擎效果
 * @returns
 */
export async function POST(request: Request) {
    const data = await request.json();
    const currentUser = await getCurrentUser();
    data['user_id'] = currentUser?.id;
    const experimentId = data['nano_id'];
    const experimentNanoId = data['experimentId'] || undefined;
    // 插入用户实验表
    const dbExperiment = await db.user_experiments.findFirst({
        where: {
            nano_id: experimentId,
        },
    });
    let d: any = {
        nano_id: experimentId,
        type: 'TRAIL',
        engine_id: parseInt(data['engine_id']),
        user_id: parseInt(data['user_id']),
    };

    if (experimentNanoId) {
        d = {
            ...d,
            experiment_id: experimentNanoId,
        };
    }

    if (!dbExperiment) {
        await db.user_experiments.create({
            data: d,
        });
    }

    let trailNanoId = data['promptNanoId'];
    // 插入用户submit记录用以生成图片
    await db.trail.create({
        data: {
            user_experiment_id: experimentId,
            user_id: data['user_id'],
            prompt: data['prompt'],
            engine_id: parseInt(data['engine_id']),
            state: 'GENERATING',
            nano_id: trailNanoId,
        },
    });

    return NextResponse.json({ msg: '发布成功' });
}
