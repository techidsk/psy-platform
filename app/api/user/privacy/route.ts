// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * /api/user/privacy
 * 获取用户信息
 *
 * @returns
 */
export async function GET(request: Request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '出现异常,请重新登录进行操作' }, { status: 500 });
    }

    if (currentUser.role === 'USER' || currentUser.role === 'GUEST') {
        // 使用当前登录用户的 ID
        const user = await db.user.findFirst({
            where: { id: parseInt(currentUser.id) },
            select: {
                username: true,
                user_group_id: true,
                tel: true,
                email: true,
                qualtrics: true,
                wechat_id: true,
                manager_id: true,
                avatar: true,
                gender: true,
                ages: true,
            },
        });
        if (!user) {
            return NextResponse.json({ msg: '未找到用户' }, { status: 404 });
        }
        if (user.gender && user.ages) {
            return NextResponse.json({ msg: '已配置' }, { status: 200 });
        } else {
            return NextResponse.json({ msg: '未配置' }, { status: 404 });
        }
    }

    return NextResponse.json({ msg: '无需处理' }, { status: 200 });
}

/**
 * /api/user/privacy
 * 上传用户性别以及年龄
 * @param request
 */
export async function PATCH(request: Request) {
    const data = await request.json();
    try {
        await db.user.update({
            where: { id: data['id'] },
            data: data,
        });
        return NextResponse.json({ msg: '修改成功' });
    } catch (error) {
        console.error('更新失败:', error);
        return NextResponse.json({ msg: '服务器错误' }, { status: 500 });
    }
}
