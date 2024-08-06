import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { generate } from '@/lib/generate';
import { getCurrentUser } from '@/lib/session';
import { AGES_MAP, GENDER_MAP } from '@/common/user';
import { logger } from '@/lib/logger';
import { trail as dbTrail } from '@prisma/client';

function getValueFromObj(key: number, map: object) {
    for (const [k, v] of Object.entries(map)) {
        if (parseInt(k) === key) {
            return v;
        }
    }
    return '';
}

/**
 * /api/generate
 * 翻译提示词并生成图片
 *
 * @returns
 */
export async function POST(request: Request) {
    const currentUser = await getCurrentUser();
    const user = currentUser?.id
        ? await db.user.findFirst({ where: { id: parseInt(currentUser.id) } })
        : undefined;

    const json = await request.json();
    const { guest, id: promptNanoId, experimentId, experimentNanoId, part: stepOrder } = json;
    const isGuest = Boolean(guest);

    if (!promptNanoId) {
        logger.error('未找到对应promptNanoId数据');
        return NextResponse.json({ msg: '发布失败，缺少参数' });
    }

    const trail = await db.trail.findFirst({
        where: { nano_id: promptNanoId },
    });

    if (!trail || !trail.prompt) {
        logger.error('未找到对应trail数据');
        return NextResponse.json({ msg: '发布失败，缺少参数' });
    }

    const userExperimentNanoId = isGuest ? experimentNanoId : experimentId;
    let userExperiment = await db.user_experiments.findFirst({
        where: { nano_id: userExperimentNanoId },
    });

    if (!userExperiment || !userExperiment.experiment_id || !userExperiment.engine_id) {
        logger.error('未找到对应userExperiment数据');
        return NextResponse.json({ msg: '发布失败，缺少参数' });
    }

    // 获取生成信息
    const engineId = userExperiment.engine_id;
    if (![1, 2, 3, 4].includes(engineId)) {
        logger.error('未找到对应engine数据');
        return NextResponse.json({ msg: '发布失败，缺少参数' });
    }
    const engine = await db.engine.findFirst({
        where: { id: engineId },
    });

    if (!engine) {
        logger.error(`未找到对应engine数据 -- engineId: ${engineId}`);
        return NextResponse.json({ msg: '发布失败，缺少参数' });
    }

    const step = await getExperimentStep(parseInt(userExperiment.experiment_id), stepOrder);
    const picMode = step?.pic_mode || true;

    logger.info(`${picMode ? '生成图片' : '不生成图片'}`);
    if (!picMode) {
        return NextResponse.json({ msg: '发布成功' });
    }

    // 获取用户最近5条内容进行发送
    const userPrompts = await fetchUserPrompts(trail);

    // 获取实验信息
    const experiment = await fetchExperiment(parseInt(userExperiment.experiment_id));
    if (!experiment) {
        logger.error('未找到对应experiment数据');
        return NextResponse.json({ msg: '发布失败，缺少参数，未找到对应的实验数据' });
    }

    logger.info(`promptNanoId: ${promptNanoId} 请求已经发送`);
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
                gender: (user?.gender && getValueFromObj(user.gender, GENDER_MAP)) || '',
                ages: (user?.ages && getValueFromObj(user.ages, AGES_MAP)) || '',
            },
            task_id: promptNanoId,
        };
        const response = await generate(generateData);
        if (response?.status === 'Task enqueued') {
            logger.info(`成功发送生成请求 [${promptNanoId}] 到生成服务器`);
            return NextResponse.json({
                msg: '发布成功',
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
    const experimentStep = await db.experiment_steps.findFirst({
        where: { experiment_id: experimentId, order: step },
    });

    const content = experimentStep?.content;
    if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
        return content;
    } else {
        // Handle the case where content is not an object
        console.error('Expected content to be an object, but received:', typeof content);
        return null;
    }
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
