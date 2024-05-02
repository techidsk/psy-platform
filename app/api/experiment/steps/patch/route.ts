import { getCurrentUser } from '@/lib/session';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getId } from '@/lib/nano-id';
import { logger } from '@/lib/logger';

/**
 * /api/experiment/steps/patch
 * 添加实验步骤
 * @returns
 */
export async function PATCH(request: Request) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '请登录后，再删除步骤', error: '未登录' }, { status: 401 });
    }
    try {
        const data = await request.json();
        const order = data.order;
        const experimentId = data.experiment_id;

        const step: {
            id?: number;
            step_name: string;
            title: string;
            step_content: string;
            step_image?: string;
            type: number;
            pic_mode?: boolean;
            countdown?: number;
            redirect_url?: string;
        } = data.step;

        await db.experiment_steps.update({
            where: {
                id: data.id,
            },
            data: {
                experiment_id: experimentId,
                step_name: step.step_name,
                order: order,
                type: step.type,
                title: step.title,
                content: {
                    content: step.step_content,
                    image: step.step_image || '',
                    redirect_url: step.redirect_url || '',
                    pic_mode: step.pic_mode || false,
                    countdown: step.countdown || 0,
                },
            },
        });
    } catch (e) {
        logger.error(`更新实验步骤失败：${e}`);
        return NextResponse.json({ msg: '更新实验步骤失败' }, { status: 500 });
    }
    return NextResponse.json({ msg: '已成功更新实验步骤' });
}
