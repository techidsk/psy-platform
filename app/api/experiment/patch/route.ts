// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { logger } from '@/lib/logger';

/**
 * /api/experiment/patch
 * 更新实验信息
 *
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

    try {
        const data = await request.json();
        if (!data.nano_id) {
            return NextResponse.json({ msg: '实验 ID 不能为空' }, { status: 400 });
        }

        const steps: {
            id?: number;
            experiment_id?: number;
            step_name: string;
            order?: number;
            title: string;
            step_content: string;
            step_image?: string;
            redirect_url?: string;
            countdown?: number;
            pic_mode?: boolean;
            type: number;
            pre: boolean;
        }[] = data.steps;

        const params = { ...data };
        delete params.steps;

        const experiment = await db.experiment.update({
            where: { nano_id: data['nano_id'] },
            data: { ...params, pic_mode: params.pic_mode ? 1 : 0 },
        });
        logger.info('已成功更新实验设置');
        // 全部删除再进行添加操作
        await db.experiment_steps.deleteMany({
            where: {
                experiment_id: experiment.id,
            },
        });
        logger.info('已成功删除实验设置');

        const newSteps = steps.map((item, index) => ({
            ...item,
            experiment_id: experiment.id,
            content: {
                image: item.step_image,
                content: item.step_content,
                redirect_url: item.redirect_url,
                countdown: item.countdown,
                pic_mode: item.pic_mode,
            },
            order: index + 1,
        }));

        for (const step of newSteps) {
            // logger.info(`handle step: ${JSON.stringify(step)} | ${step?.id || -1}`);
            const { step_content, step_image, countdown, pic_mode, redirect_url, ...rest } = step;

            await db.experiment_steps.upsert({
                where: {
                    id: step?.id || -1, // 对于新步骤，使用 -1 或其他标识符
                },
                update: {
                    ...rest,
                    pre: Boolean(rest.pre),
                },
                create: {
                    ...rest,
                    pre: Boolean(rest.pre),
                },
            });
        }

        return NextResponse.json({ msg: '添加成功' });
    } catch (error) {
        console.error('更新失败:', error);
        return NextResponse.json({ msg: '服务器错误' }, { status: 500 });
    }
}
