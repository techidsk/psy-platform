import { getCurrentUser } from '@/lib/session';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getId } from '@/lib/nano-id';
import { logger } from '@/lib/logger';

/**
 * /api/experiment/steps/delete
 * 添加实验步骤
 * @returns
 */
export async function DELETE(request: Request) {
    const data = await request.json();
    const stepId = data.id;
    const experimentId = data.experiment_id;

    if (!experimentId) {
        return NextResponse.json(
            { msg: '实验ID不能为空', error: '实验ID不能为空' },
            { status: 400 }
        );
    }
    if (!stepId) {
        return NextResponse.json(
            { msg: '步骤ID不能为空', error: '步骤ID不能为空' },
            { status: 400 }
        );
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '请登录后，再删除步骤', error: '未登录' }, { status: 401 });
    }

    try {
        await db.experiment_steps.delete({
            where: { id: stepId, experiment_id: experimentId },
        });
    } catch (e) {
        logger.error(`添加实验步骤失败：${e}`);
        return NextResponse.json({ msg: '添加实验步骤失败', error: e }, { status: 500 });
    }
    return NextResponse.json({ msg: '已成功删除' });
}
