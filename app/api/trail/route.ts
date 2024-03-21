import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { logger } from '@/lib/logger';

/**
 * /api/trail
 * 用户测试引擎效果
 * @returns
 */
export async function POST(request: Request) {
    const data = await request.json();
    const currentUser = await getCurrentUser();
    const guest = data['guest'] || false;

    if (!guest) {
        data['user_id'] = currentUser?.id;
    } else {
        const guestNanoId = data['guestNanoId'];
        const guestUser = await db.user.findFirst({
            where: { nano_id: guestNanoId },
        });
        data['user_id'] = guestUser?.id;
    }

    const experimentNanoId = data['nano_id']; // 本次实验ID

    const trailNanoId = data['promptNanoId'];
    const prompt = data['prompt'];
    const userId = data['user_id'];
    // 插入用户submit记录用以生成图片
    await db.trail.create({
        data: {
            user_experiment_id: experimentNanoId,
            user_id: parseInt(userId),
            prompt: prompt,
            state: 'GENERATING',
            nano_id: trailNanoId,
        },
    });

    return NextResponse.json({ msg: '发布成功' });
}
