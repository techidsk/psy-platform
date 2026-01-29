// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * /api/experiment/[id]
 * 获取实验
 *
 * @returns
 */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {}

/**
 * 删除实验
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

    // 1. 需要判断实验是否激活
    const experiment = await db.experiment.findFirst({
        where: { id: parseInt(id) },
    });
    if (!experiment) {
        return NextResponse.json({ msg: '实验不存在' }, { status: 404 });
    }

    // 2. 判断是否有相关实验分组
    try {
        const groupExperiments = await db.project_group_experiments.findMany({
            where: { experiment_id: parseInt(id) },
        });

        if (groupExperiments.length > 0) {
            const groupId = groupExperiments[0].project_group_id;
            const group = await db.project_group.findFirst({
                where: { id: groupId },
            });

            if (group) {
                return NextResponse.json({ msg: '实验已被分配到分组中,无法删除' }, { status: 500 });
            }
        }

        const experimentId = parseInt(id);
        await db.experiment.update({
            where: { id: experimentId },
            data: {
                available: 0,
            },
        });

        await db.experiment_steps.deleteMany({
            where: { experiment_id: experimentId },
        });

        return NextResponse.json({ msg: '已删除实验' });
    } catch (error) {
        return NextResponse.json({ msg: '删除失败' }, { status: 500 });
    }
}
