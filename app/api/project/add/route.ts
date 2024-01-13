// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import dayjs from 'dayjs';

/**
 * /api/project/add
 * @returns
 */
export async function POST(request: Request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '出现异常,请重新登录进行操作' }, { status: 401 });
    }

    if (currentUser.role !== 'ADMIN') {
        return NextResponse.json({ msg: '没有权限' }, { status: 403 });
    }

    const data = await request.json();
    try {
        await db.projects.create({
            data: {
                ...data,
                start_time: dayjs(data.start_time).hour(12).toDate(),
                end_time: dayjs(data.end_time).hour(12).toDate(),
                state: 'DRAFT',
            },
        });

        return NextResponse.json({ msg: '添加成功' });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ msg: '添加失败' }, { status: 500 });
    }
}
