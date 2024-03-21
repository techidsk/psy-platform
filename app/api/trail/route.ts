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
    console.log(data);
    const currentUser = await getCurrentUser();
    data['user_id'] = currentUser?.id;
    const experimentNanoId = data['nano_id']; // 本次实验ID

    let trailNanoId = data['promptNanoId'];
    // 插入用户submit记录用以生成图片
    await db.trail.create({
        data: {
            user_experiment_id: experimentNanoId,
            user_id: parseInt(data['user_id']),
            prompt: data['prompt'],
            state: 'GENERATING',
            nano_id: trailNanoId,
        },
    });

    return NextResponse.json({ msg: '发布成功' });
}
