import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { generateImage } from '@/lib/generate';
import { getCurrentUser } from '@/lib/session';
import { logger } from '@/lib/logger';
import { assemblePrompt, updateContextSummary } from '@/lib/prompt-preprocess';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { uploadFile } = require('../../../src/lib/upload.js');

/**
 * /api/generate
 * 生成图片（同步调用 Doubao API）
 *
 * @returns
 */
export async function POST(request: Request) {
    const json = await request.json();
    const { guest, id: promptNanoId, experimentId, experimentNanoId, part: stepOrder, size } = json;
    const isGuest = Boolean(guest);
    const startTime = Date.now();

    if (!promptNanoId || promptNanoId === 'undefined') {
        logger.error({ promptNanoId }, 'promptNanoId 缺失或无效');
        return NextResponse.json(
            { msg: '发布失败，promptNanoId为undefined或缺失' },
            { status: 400 }
        );
    }

    if (
        (isGuest && (!experimentNanoId || experimentNanoId === 'undefined')) ||
        (!isGuest && (!experimentId || experimentId === 'undefined'))
    ) {
        logger.error({ isGuest, experimentId, experimentNanoId }, 'experiment ID 缺失或无效');
        return NextResponse.json(
            { msg: '发布失败，experiment ID为undefined或缺失' },
            { status: 400 }
        );
    }

    if (stepOrder === undefined || stepOrder === 'undefined') {
        logger.error({ promptNanoId, stepOrder }, 'stepOrder 缺失或无效');
        return NextResponse.json({ msg: '发布失败，步骤参数为undefined或缺失' }, { status: 400 });
    }

    const trail = await db.trail.findFirst({
        where: { nano_id: promptNanoId },
    });

    if (!trail || !trail.prompt) {
        logger.error({ promptNanoId }, '未找到对应 trail 数据');
        return NextResponse.json({ msg: '发布失败，缺少参数' }, { status: 400 });
    }

    const currentUser = await getCurrentUser();
    const userExperimentNanoId = isGuest ? experimentNanoId : experimentId;

    if (!userExperimentNanoId || userExperimentNanoId === 'undefined') {
        logger.error({ promptNanoId, userExperimentNanoId }, 'userExperimentNanoId 无效');
        return NextResponse.json({ msg: '发布失败，无效的实验ID' }, { status: 400 });
    }

    const userExperiment = await db.user_experiments.findFirst({
        where: { nano_id: userExperimentNanoId },
    });

    if (!userExperiment || !userExperiment.experiment_id || !userExperiment.engine_id) {
        logger.error({ promptNanoId, userExperimentNanoId }, '未找到对应 userExperiment 数据');
        return NextResponse.json({ msg: '发布失败，缺少参数' }, { status: 400 });
    }

    const engineId = userExperiment.engine_id;
    if (!engineId || isNaN(Number(engineId))) {
        logger.error({ promptNanoId, engineId }, '引擎ID无效');
        return NextResponse.json({ msg: '发布失败，引擎ID无效' }, { status: 400 });
    }

    const engine = await db.engine.findFirst({
        where: { id: engineId },
    });

    if (!engine) {
        logger.error({ promptNanoId, engineId }, '未找到对应 engine 数据');
        return NextResponse.json({ msg: '发布失败，缺少参数' }, { status: 400 });
    }

    // 检查是否需要生成图片
    const step = await getExperimentStep(parseInt(userExperiment.experiment_id), stepOrder);
    const picMode = step === null ? true : (step?.pic_mode ?? false);

    logger.info({ promptNanoId, picMode }, '图像模式检查');
    if (!picMode) {
        await db.trail.update({
            where: { nano_id: promptNanoId },
            data: { state: 'SUCCESS' },
        });
        return NextResponse.json({ msg: '不需要生成图片' });
    }

    // 并行获取意图画像和上下文摘要
    const templateContent = (engine.template as any)?.prompt || '';
    const [experiment, userExpContext] = await Promise.all([
        db.experiment.findFirst({
            where: { id: parseInt(userExperiment.experiment_id!) },
            select: { intent_profile: true },
        }),
        db.user_experiments.findFirst({
            where: { id: userExperiment.id },
            select: { context_summary: true },
        }),
    ]);

    // 组装提示词（纯模板拼接，无 LLM 调用）
    const assembledPrompt = assemblePrompt({
        userInput: trail.prompt!,
        intentProfile: experiment?.intent_profile || null,
        contextSummary: userExpContext?.context_summary || null,
        styleTemplate: templateContent,
    });

    logger.info(
        {
            promptNanoId,
            engineId,
            size,
            userInput: trail.prompt,
            intentProfile: experiment?.intent_profile
                ? experiment.intent_profile.substring(0, 200)
                : '(空)',
            contextSummary: userExpContext?.context_summary || '(空)',
            styleTemplate: templateContent || '(空)',
            assembledPrompt,
            assembledPromptLength: assembledPrompt.length,
        },
        '开始生成图片任务'
    );

    try {
        const imageUrl = await generateImage(assembledPrompt, size);

        // 转存到 OSS，防止 Doubao 临时 URL 过期
        let finalUrl: string = imageUrl;
        try {
            const ossPath = `trail/${promptNanoId}.png`;
            const ab = await fetch(imageUrl).then((r) => r.arrayBuffer());
            const imgBuffer = Buffer.from(ab as ArrayBuffer);
            const ossUrl = await uploadFile(imgBuffer, ossPath);
            if (ossUrl) {
                finalUrl = ossUrl;
                logger.info({ promptNanoId, ossPath }, 'OSS 转存成功');
            } else {
                logger.warn({ promptNanoId }, 'OSS 转存返回空 URL，使用 Doubao 原始 URL');
            }
        } catch (ossError) {
            logger.warn(
                { promptNanoId, error: String(ossError) },
                'OSS 转存失败，使用 Doubao 原始 URL'
            );
        }

        const elapsed = Date.now() - startTime;

        await db.trail.update({
            where: { nano_id: promptNanoId },
            data: {
                state: 'SUCCESS',
                image_url: finalUrl,
                generate_prompt: assembledPrompt,
                update_time: new Date(),
            },
        });

        // 同步更新上下文摘要，带超时保护（避免快速连续提交时读到旧值）
        const CONTEXT_UPDATE_TIMEOUT = 5000;
        try {
            await Promise.race([
                (async () => {
                    const newSummary = await updateContextSummary(
                        trail.prompt!,
                        userExpContext?.context_summary || null
                    );
                    await db.user_experiments.update({
                        where: { id: userExperiment.id },
                        data: { context_summary: newSummary },
                    });
                })(),
                new Promise((_, reject) =>
                    setTimeout(
                        () => reject(new Error('context_summary 更新超时')),
                        CONTEXT_UPDATE_TIMEOUT
                    )
                ),
            ]);
        } catch (err) {
            logger.warn(
                { promptNanoId, error: String(err) },
                '上下文摘要更新失败或超时，不影响本次生成'
            );
        }

        logger.info({ promptNanoId, elapsed }, '生成任务完成，图片 URL 已保存');

        // 解析 intentProfile 提取 image_guidance
        let intentProfileParsed: Record<string, unknown> | null = null;
        try {
            if (experiment?.intent_profile) {
                intentProfileParsed = JSON.parse(experiment.intent_profile);
            }
        } catch {
            // ignore
        }

        return NextResponse.json({
            msg: '发布成功',
            url: finalUrl,
            prompt: assembledPrompt,
            debug: {
                styleTemplate: templateContent || null,
                userInput: trail.prompt,
                contextSummary: userExpContext?.context_summary || null,
                intentProfile: intentProfileParsed,
                imageGuidance: (intentProfileParsed as any)?.image_guidance || null,
                assembledPrompt,
                assembledPromptLength: assembledPrompt.length,
            },
        });
    } catch (error) {
        const elapsed = Date.now() - startTime;
        logger.error({ promptNanoId, error: String(error), elapsed }, '生成任务失败');
        try {
            await db.trail.update({
                where: { nano_id: promptNanoId },
                data: { state: 'FAILED', update_time: new Date() },
            });
        } catch (updateError) {
            logger.error({ promptNanoId, error: String(updateError) }, '更新 trail 状态失败');
        }
        return NextResponse.json({ msg: '发布失败，图片生成异常' }, { status: 500 });
    }
}

async function getExperimentStep(experimentId: number, step: number) {
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
