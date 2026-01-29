// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * /api/project/[id]
 * 获取项目
 *
 * @returns
 */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {}

/**
 * 删除项目
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

    // 1. 需要判断项目是否激活
    const project = await db.projects.findFirst({
        where: { id: parseInt(id) },
    });
    if (!project) {
        return NextResponse.json({ msg: '项目不存在' }, { status: 404 });
    }

    if (project.state === 'AVAILABLE') {
        return NextResponse.json({ msg: '该项目已激活，请修改状态后删除' }, { status: 403 });
    }
    // 2. 判断是否有相关实验分组
    try {
        await db.projects.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ msg: '已删除项目' });
    } catch (error) {
        return NextResponse.json({ msg: '删除失败' }, { status: 500 });
    }
}
