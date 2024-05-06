import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/session';
import { NextResponse } from 'next/server';

/**
 * /api/experiment/steps/order
 * 修改实验步骤顺序
 *
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
    const experimentStepId = data.id;
    const order = (data.order as string).toUpperCase(); // 分 UP DOWN;
    try {
        const experimentStep = await db.experiment_steps.findUnique({
            where: { id: experimentStepId },
        });
        if (!experimentStep) {
            return NextResponse.json({ msg: '实验步骤不存在' }, { status: 404 });
        }

        const experimentId = experimentStep.experiment_id;
        const currentIndex = experimentStep.order;

        if (!currentIndex) {
            return NextResponse.json({ msg: '实验步骤不存在' }, { status: 404 });
        }

        const tempIndex = 255; // 或者选择一个绝对不会冲突的值

        await db.$transaction(async (trans) => {
            if ('UP' === order) {
                const prevExperimentStep = await trans.experiment_steps.findFirst({
                    where: {
                        experiment_id: experimentId,
                        order: { lt: currentIndex },
                    },
                    orderBy: { order: 'desc' },
                });
                if (prevExperimentStep) {
                    // 更新当前实验的 index 为临时值
                    await trans.experiment_steps.update({
                        where: { id: experimentStepId },
                        data: { order: tempIndex },
                    });

                    // 更新前一个实验的 index 为当前实验的 index
                    await trans.experiment_steps.update({
                        where: { id: prevExperimentStep.id },
                        data: { order: currentIndex },
                    });

                    // 最后，将当前实验的 index 更新为前一个实验的 index
                    await trans.experiment_steps.update({
                        where: { id: experimentStepId },
                        data: { order: prevExperimentStep.order },
                    });
                }
            } else if ('DOWN' === order) {
                const nextExperimentStep = await trans.experiment_steps.findFirst({
                    where: {
                        experiment_id: experimentId,
                        order: { gt: currentIndex },
                    },
                    orderBy: { order: 'asc' },
                });
                if (nextExperimentStep) {
                    // 使用临时值来避免唯一约束问题

                    // 更新当前实验的 index 为临时值
                    await trans.experiment_steps.update({
                        where: { id: experimentStepId },
                        data: { order: tempIndex },
                    });

                    // 更新下一个实验的 index 为当前实验的 index
                    await trans.experiment_steps.update({
                        where: { id: nextExperimentStep.id },
                        data: { order: currentIndex },
                    });

                    // 最后，将当前实验的 index 更新为下一个实验的 index
                    await trans.experiment_steps.update({
                        where: { id: experimentStepId },
                        data: { order: nextExperimentStep.order },
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
