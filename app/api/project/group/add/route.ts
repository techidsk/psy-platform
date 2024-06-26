// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { logger } from '@/lib/logger';

/**
 * /api/project/group/add
 * 创建项目分组
 * @returns
 */
export async function POST(request: Request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '出现异常,请重新登录进行操作' }, { status: 401 });
    }

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ msg: '没有权限' }, { status: 403 });
    }

    const data = await request.json();
    try {
        await db.project_group.create({
            data: {
                ...data,
                state: 'UNASSIGNED',
            },
        });
        return NextResponse.json({ msg: '添加成功' });
    } catch (err) {
        logger.error(err);
        return NextResponse.json({ msg: '添加失败' }, { status: 500 });
    }
}
