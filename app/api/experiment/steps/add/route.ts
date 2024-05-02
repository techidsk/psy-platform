import { getCurrentUser } from '@/lib/session';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getId } from '@/lib/nano-id';
import { logger } from '@/lib/logger';

/**
 * /api/experiment/steps/add
 * 添加实验步骤
 * @returns
 */
export async function POST(request: Request) {
    const data = await request.json();
    const experimentId = data.experiment_id;

    logger.info(`添加实验步骤：${JSON.stringify(data)}`);
    logger.info(`experimentId：${experimentId}`);
    if (!experimentId) {
        return NextResponse.json(
            { msg: '请创建实验后，添加步骤', error: '实验ID不能为空' },
            { status: 400 }
        );
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '请登录后，再添加步骤', error: '未登录' }, { status: 401 });
    }

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

    try {
        const prevStep = await db.experiment_steps.findFirst({
            where: {
                experiment_id: experimentId,
            },
            orderBy: {
                order: 'desc',
            },
        });

        // TODO 添加实验步骤
        await db.experiment_steps.createMany({
            data: {
                experiment_id: experimentId,
                step_name: step.step_name,
                order: (prevStep?.order || 0) + 1,
                type: step.type,
                title: step.title,
                content: {
                    content: step.step_content,
                    image: step.step_image || '',
                    redirect_url: step.redirect_url || '',
                    pic_mode: step.pic_mode || false,
                    countdown: step.countdown || 0,
                },
                random_id: getId(),
                nano_id: getId(),
            },
        });
    } catch (e) {
        logger.error(`添加实验步骤失败：${e}`);
        return NextResponse.json({ msg: '添加实验步骤失败', error: e }, { status: 500 });
    }
    return NextResponse.json({ msg: 'success' });
}
