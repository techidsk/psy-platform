import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

/**
 * /api/log
 * 记录用户操作记录
 *
 * @returns
 */
export async function POST(request: Request) {
    const json = await request.json();

    try {
        // 记录日志
        // ...
        await db.trail_logger.createMany({
            data: json,
        });
        return NextResponse.json({ msg: '添加成功' });
    } catch (error) {
        logger.error(`更新失败:${error}`);
        return NextResponse.json({ msg: '服务器错误' }, { status: 500 });
    }
}
