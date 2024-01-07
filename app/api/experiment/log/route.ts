// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * /api/experiment/log
 * 获取用户实验记录详情
 * @returns
 */
export async function POST(request: Request) {
    const data = await request.json();
    const infomations = await db.user_experiments.findFirst({
        where: {
            nano_id: data['nano_id'],
        },
    });
    if (!infomations) {
        return NextResponse.json({});
    }
    return NextResponse.json(infomations);
}
