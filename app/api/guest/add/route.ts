// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import dayjs from 'dayjs';

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
            console.log('Guest user ', guestUser.id);
            return NextResponse.json({ msg: '添加成功', data: guestUser?.id });
        }

        const user = await db.user.create({
            data: {
                nano_id: data.nano_id,
                user_role: 'GUEST',
                username: data.nano_id,
            },
        });
        console.log('Guest user ', user.id);
        return NextResponse.json({ msg: '添加成功', data: user?.id });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ msg: '添加失败' }, { status: 500 });
    }
}
