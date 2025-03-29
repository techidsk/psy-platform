// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

/**
 * /api/project/patch
 * 更新项目分组
 * @returns
 */
export async function PATCH(request: Request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '出现异常,请重新登录进行操作' }, { status: 401 });
    }

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ msg: '没有权限' }, { status: 403 });
    }

    const data = await request.json();
    try {
        const { id, ...updateData } = data;

        // 验证项目ID是否存在
        if (!id) {
            return NextResponse.json({ msg: '项目ID不能为空' }, { status: 400 });
        }

        await db.projects.update({
            where: { id: id },
            data: updateData,
        });
        // TODO 添加项目分组关联的实验
        // await db.project_group_experiments.update
        revalidatePath('/projects');
        return NextResponse.json({ msg: '更新成功' });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ msg: '更新失败' }, { status: 500 });
    }
}
