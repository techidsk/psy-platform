import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { generate } from '@/lib/generate';
import { getCurrentUser } from '@/lib/session';
import { AGES_MAP, GENDER_MAP } from '@/common/user';
import { logger } from '@/lib/logger';
import { trail as dbTrail } from '@prisma/client';

function getValueFromObj(key: number, map: Record<number, string>) {
    return map[key] || '';
}

/**
 * /api/generate
 * 翻译提示词并生成图片
 *
 * @returns
 */
export async function POST(request: Request) {
    const json = await request.json();
    const { guest, id: promptNanoId, experimentId, experimentNanoId, part: stepOrder } = json;
    const isGuest = Boolean(guest);

    // 检查关键参数是否为undefined
    if (!promptNanoId || promptNanoId === 'undefined') {
        logger.error('promptNanoId为undefined或缺失');
        return NextResponse.json({ msg: '发布失败，promptNanoId为undefined或缺失' });
    }

    if (
        (isGuest && (!experimentNanoId || experimentNanoId === 'undefined')) ||
        (!isGuest && (!experimentId || experimentId === 'undefined'))
    ) {
        logger.error('experiment ID为undefined或缺失');
        return NextResponse.json({ msg: '发布失败，experiment ID为undefined或缺失' });
    }

    if (stepOrder === undefined || stepOrder === 'undefined') {
        logger.error('stepOrder为undefined或缺失');
        return NextResponse.json({ msg: '发布失败，步骤参数为undefined或缺失' });
    }

    const trail = await db.trail.findFirst({
        where: { nano_id: promptNanoId },
    });

    if (!trail || !trail.prompt) {
        logger.error('未找到对应trail数据');
        return NextResponse.json({ msg: '发布失败，缺少参数' });
    }

    const currentUser = await getCurrentUser();
    const user = currentUser?.id
        ? await db.user.findFirst({ where: { id: parseInt(currentUser.id) } })
        : await db.user.findFirst({ where: { id: trail?.user_id || 0 } });

    const userExperimentNanoId = isGuest ? experimentNanoId : experimentId;

    // 再次检查userExperimentNanoId是否有效
    if (!userExperimentNanoId || userExperimentNanoId === 'undefined') {
        logger.error('userExperimentNanoId无效或为undefined');
        return NextResponse.json({ msg: '发布失败，无效的实验ID' });
    }

    let userExperiment = await db.user_experiments.findFirst({
        where: { nano_id: userExperimentNanoId },
    });

    if (!userExperiment || !userExperiment.experiment_id || !userExperiment.engine_id) {
        logger.error('未找到对应userExperiment数据');
        return NextResponse.json({ msg: '发布失败，缺少参数' });
    }

    // 获取生成信息
    const engineId = userExperiment.engine_id;
    if (!engineId || isNaN(Number(engineId))) {
        logger.error(`无效的引擎ID: ${engineId}`);
        return NextResponse.json({ msg: '发布失败，引擎ID无效' });
    }

    const engine = await db.engine.findFirst({
        where: { id: engineId },
    });

    if (!engine) {
        logger.error(`未找到对应engine数据 -- engineId: ${engineId}`);
        return NextResponse.json({ msg: '发布失败，缺少参数' });
    }

    const step = await getExperimentStep(parseInt(userExperiment.experiment_id), stepOrder);
    const picMode = step === null ? true : step?.pic_mode ?? false;

    logger.info(`图像模式：${picMode ? '生成图片' : '不生成图片'}`);
    if (!picMode) {
        await db.trail.update({
            where: { nano_id: promptNanoId },
            data: { state: 'SUCCESS' },
        });
        return NextResponse.json({ msg: '不需要生成图片' });
    }

    // 获取用户最近5条内容进行发送
    const userPrompts = await fetchUserPrompts(trail);

    // 获取实验信息
    if (
        !userExperiment.experiment_id ||
        userExperiment.experiment_id === undefined ||
        isNaN(parseInt(userExperiment.experiment_id))
    ) {
        logger.error(`实验ID无效: ${userExperiment.experiment_id}`);
        return NextResponse.json({ msg: '发布失败，无效的实验ID' });
    }

    const experiment = await fetchExperiment(parseInt(userExperiment.experiment_id));
    if (!experiment) {
        logger.error('未找到对应experiment数据');
        return NextResponse.json({ msg: '发布失败，缺少参数，未找到对应的实验数据' });
    }

    logger.info(`===== 生成任务：[${promptNanoId}] 准备发送请求 =====`);
    try {
        const generateData = {
            user_prompts: userPrompts,
            engine_id: engine.id,
            gpt: {
                gpt_prompt: engine.gpt_prompt,
                gpt_setting: engine.gpt_settings,
            },
            template: engine.template,
            user: {
                gender: GENDER_MAP[user?.gender || 0] || '',
                ages: AGES_MAP[user?.ages || 0] || '',
            },
            task_id: promptNanoId,
        };
        logger.info(`用户性别: ${user?.gender} 用户年龄: ${user?.ages}`);
        const response = await generate(generateData);

        if (response?.status === 'Task enqueued') {
            logger.info(`===== 生成任务：[${promptNanoId}] 成功发送生成请求 =====`);
            await db.trail.update({
                where: { nano_id: promptNanoId },
                data: { request_id: response?.task_id },
            });
            return NextResponse.json({
                msg: '发布成功',
                request_id: response?.task_id,
                url: response?.image_url,
                prompt: response?.chat_result,
            });
        } else {
            await db.trail.update({
                where: { nano_id: promptNanoId },
                data: { state: 'FAILED' },
            });
            logger.error(`算法生成图片失败`);
            return NextResponse.json({ msg: '发布失败，生成服务未能响应' }, { status: 401 });
        }
    } catch (error) {
        logger.error(error);
        return NextResponse.json({ msg: '发布失败，服务端数据处理异常' }, { status: 401 });
    }
}

async function getExperimentStep(experimentId: number, step: number) {
    // 检查参数是否有效
    if (experimentId === undefined || isNaN(experimentId) || step === undefined || isNaN(step)) {
        logger.error(`Invalid parameters: experimentId: ${experimentId}, step: ${step}`);
        return null;
    }

    const experimentStep = await db.experiment_steps.findFirst({
        where: { experiment_id: experimentId, order: step },
    });

    if (!experimentStep) {
        logger.error(`No experiment step found for experimentId: ${experimentId}, step: ${step}`);
        return null;
    }

    if (!isValidContent(experimentStep.content)) {
        logger.error(
            `Invalid content for experimentId: ${experimentId}, step: ${step}. Received: ${typeof experimentStep.content}`
        );
        return null;
    }

    return experimentStep.content;
}

function isValidContent(content: unknown): content is Record<string, unknown> {
    return typeof content === 'object' && content !== null && !Array.isArray(content);
}

/**
 * 获取用户最近5条内容
 * @param trail
 */
async function fetchUserPrompts(trail: dbTrail) {
    return await db.trail.findMany({
        where: { user_id: trail.user_id, user_experiment_id: trail.user_experiment_id },
        select: { prompt: true, generate_prompt: true },
        orderBy: { create_time: 'desc' },
        take: 5,
    });
}

async function fetchExperiment(userExperimentId: number) {
    return await db.experiment.findFirst({
        where: { id: userExperimentId },
    });
}
