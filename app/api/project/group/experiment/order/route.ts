import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/session';
import { NextResponse } from 'next/server';

/**
 * /api/project/group/experiment/order
 * 删除实验分组分配的实验
 * @param request
 * @param context
 * @returns
 */
export async function POST(request: Request, context: { params: any }) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '出现异常,请重新登录进行操作' }, { status: 500 });
    }

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPERADMIN') {
        return NextResponse.json({ msg: '没有权限' }, { status: 403 });
    }

    const data = await request.json();
    const projectGroupExperimentId = data.id;
    const order = (data.order as string).toUpperCase(); // 分 UP DOWN;
    try {
        const projectGroupExperiment = await db.project_group_experiments.findUnique({
            where: { id: projectGroupExperimentId },
        });
        if (!projectGroupExperiment) {
            return NextResponse.json({ msg: '实验分组不存在' }, { status: 404 });
        }

        const projectGroupId = projectGroupExperiment.project_group_id;
        const currentIndex = projectGroupExperiment.experiment_index;

        const tempIndex = 255; // 或者选择一个绝对不会冲突的值

        await db.$transaction(async (trans) => {
            if ('UP' === order) {
                const prevProjectGroupExperiment = await trans.project_group_experiments.findFirst({
                    where: {
                        project_group_id: projectGroupId,
                        experiment_index: { lt: currentIndex },
                    },
                    orderBy: { experiment_index: 'desc' },
                });
                if (prevProjectGroupExperiment) {
                    // 更新当前实验的 index 为临时值
                    await trans.project_group_experiments.update({
                        where: { id: projectGroupExperimentId },
                        data: { experiment_index: tempIndex },
                    });

                    // 更新前一个实验的 index 为当前实验的 index
                    await trans.project_group_experiments.update({
                        where: { id: prevProjectGroupExperiment.id },
                        data: { experiment_index: currentIndex },
                    });

                    // 最后，将当前实验的 index 更新为前一个实验的 index
                    await trans.project_group_experiments.update({
                        where: { id: projectGroupExperimentId },
                        data: { experiment_index: prevProjectGroupExperiment.experiment_index },
                    });
                }
            } else if ('DOWN' === order) {
                const nextProjectGroupExperiment = await trans.project_group_experiments.findFirst({
                    where: {
                        project_group_id: projectGroupId,
                        experiment_index: { gt: currentIndex },
                    },
                    orderBy: { experiment_index: 'asc' },
                });
                if (nextProjectGroupExperiment) {
                    // 使用临时值来避免唯一约束问题

                    // 更新当前实验的 index 为临时值
                    await trans.project_group_experiments.update({
                        where: { id: projectGroupExperimentId },
                        data: { experiment_index: tempIndex },
                    });

                    // 更新下一个实验的 index 为当前实验的 index
                    await trans.project_group_experiments.update({
                        where: { id: nextProjectGroupExperiment.id },
                        data: { experiment_index: currentIndex },
                    });

                    // 最后，将当前实验的 index 更新为下一个实验的 index
                    await trans.project_group_experiments.update({
                        where: { id: projectGroupExperimentId },
                        data: { experiment_index: nextProjectGroupExperiment.experiment_index },
                    });
                }
            } else {
                logger.error(`参数 [order] 错误: ${order}`);
                return NextResponse.json({ msg: '参数错误' }, { status: 400 });
            }
        });
        return NextResponse.json({ msg: '已删除分组' });
    } catch (error) {
        logger.error(error);
        return NextResponse.json({ msg: '删除失败' }, { status: 500 });
    }
}
