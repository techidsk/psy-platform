// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * /api/user/[id]
 * 获取用户信息
 *
 * @returns
 */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '出现异常,请重新登录进行操作' }, { status: 500 });
    }

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ msg: '没有权限' }, { status: 403 });
    }

    // 判断是否有用户存在
    const user = await db.user.findFirst({
        where: { id: parseInt(id) },
        select: {
            username: true,
            user_group_id: true,
            tel: true,
            email: true,
            qualtrics: true,
            wechat_id: true,
            manager_id: true,
            avatar: true,
        },
    });
    if (user) {
        return NextResponse.json(user);
    } else {
        return NextResponse.json({ msg: '用户不存在' }, { status: 404 });
    }
}

/**
 * 删除用户
 * @param request
 * @param context
 * @returns
 */
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '出现异常,请重新登录进行操作' }, { status: 500 });
    }

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ msg: '没有权限' }, { status: 403 });
    }
    try {
        await db.user.update({
            where: { id: parseInt(id) },
            data: { deleted: 1 },
        });

        return NextResponse.json({ msg: '已删除用户' });
    } catch (error) {
        return NextResponse.json({ msg: '删除失败' }, { status: 500 });
    }
}
