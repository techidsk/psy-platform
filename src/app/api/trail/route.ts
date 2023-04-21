import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';

/**
 * /api/trail
 * 用户测试引擎效果
 * @returns 
 */
export async function POST(request: Request) {
    const data = await request.json()
    const currentUser = await getCurrentUser()
    data['user_id'] = currentUser?.id

    console.log(data)
    // 插入用户实验表
    const dbExperiment = await db.psy_user_experiments.findFirst({
        where: {
            nano_id: data['nano_id']
        }
    })
    console.log('dbExperiment : ', dbExperiment)
    if (!dbExperiment) {
        await db.psy_user_experiments.create({
            data: {
                nano_id: data['nano_id'],
                type: 'TRAIL',
                engine_id: parseInt(data['engine_id']),
                user_id: BigInt(data['user_id']),
            }
        })
    }

    // 插入用户submit记录用以生成图片
    await db.psy_trail.create({
        data: {
            user_experiment_id: data['nano_id'],
            user_id: BigInt(data['user_id']),
            prompt: data['prompt'],
            engine_id: parseInt(data['engine_id']),
            state: 'GENERATING'
        }
    })

    db.$disconnect()
    return NextResponse.json({ 'msg': '注册成功' });
}
