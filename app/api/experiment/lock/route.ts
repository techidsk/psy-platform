// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * /api/experiment/lock
 * @returns
 */
export async function POST(request: Request) {
    const data = await request.json();
    // 判断用户是否有输入内容
    await db.experiment.update({
        where: { id: data.id },
        data: {
            lock: data.lock,
        },
    });

    return NextResponse.json({ msg: '已完成写作' });
}
