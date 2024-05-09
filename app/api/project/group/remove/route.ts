// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * /api/project/group/remove
 * 解除绑定项目和项目分组
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
        const projectId = data.project_id as number;
        const groupId = data.group_id as number;
        // 判断是否绑定
        const dbGroup = await db.project_group.findFirst({
            where: {
                project_id: projectId,
                id: groupId,
            },
        });
        if (!dbGroup) {
            // 无找到对应分组
            return NextResponse.json({ msg: '未绑定' }, { status: 400 });
        }

        // 更新分组
        await db.project_group.update({
            where: {
                id: groupId,
            },
            data: {
                project_id: null,
                state: 'UNASSIGNED',
            },
        });
        return NextResponse.json({ msg: '更新成功' });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ msg: '更新失败' }, { status: 500 });
    }
}
