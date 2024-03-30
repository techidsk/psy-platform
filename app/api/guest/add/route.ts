// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * /api/guest/add
 * 创建临时用户
 *
 * @returns
 */
export async function POST(request: Request) {
    const data = await request.json();
    try {
        const guestUser = await db.user.findFirst({
            where: {
                nano_id: data.nano_id,
            },
        });
        if (guestUser) {
            logger.info(`获取临时用户 ${guestUser.id}`);
            return NextResponse.json({ msg: '添加成功', data: guestUser?.id });
        }
        // 临时被试注册
        const user = await db.user.create({
            data: {
                nano_id: data.nano_id,
                user_role: 'GUEST',
                username: data.nano_id,
            },
        });
        logger.info(`创建临时用户 ${user.id}`);
        return NextResponse.json({ msg: '添加成功', data: user?.id });
    } catch (err) {
        logger.error(err);
        return NextResponse.json({ msg: '添加失败' }, { status: 500 });
    }
}
