import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { NextResponse } from 'next/server';

/**
 * /api/project/group/experiment/[id]
 * 删除实验分组分配的实验
 * @param request
 * @param context
 * @returns
 */
export async function DELETE(request: Request, context: { params: any }) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '出现异常,请重新登录进行操作' }, { status: 500 });
    }

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ msg: '没有权限' }, { status: 403 });
    }
    try {
        const experimentId = parseInt(context.params.id);
        await db.project_group_experiments.delete({
            where: { id: experimentId },
        });

        return NextResponse.json({ msg: '已删除分组' });
    } catch (error) {
        return NextResponse.json({ msg: '删除失败' }, { status: 500 });
    }
}
