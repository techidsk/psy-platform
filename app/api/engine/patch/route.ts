// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * /api/engine/patch
 * 更新用户信息
 *
 * @returns
 */
export async function PATCH(request: Request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '出现异常,请重新登录进行操作' }, { status: 401 });
    }

    if (currentUser.role !== 'ADMIN') {
        return NextResponse.json({ msg: '没有权限' }, { status: 403 });
    }
    try {
        const data = await request.json();
        if (!data.id) {
            return NextResponse.json({ msg: '引擎 ID 不能为空' }, { status: 400 });
        }

        await db.engine.update({
            where: { id: data['id'] },
            data: data,
        });

        return NextResponse.json({ msg: '添加成功' });
    } catch (error) {
        console.error('更新失败:', error);
        return NextResponse.json({ msg: '服务器错误' }, { status: 500 });
    }
}
