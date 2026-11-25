import { db } from '@/lib/db';
import { after, NextResponse } from 'next/server';
import { generateImage } from '@/lib/generate';
import { getCurrentUser } from '@/lib/session';
import { logger } from '@/lib/logger';
import { assemblePrompt, updateContextSummary } from '@/lib/prompt-preprocess';

import { archiveImage } from '@/lib/image-archive';
import { DEFAULT_IMAGE_SIZE } from '@/lib/image-size';

/**
 * /api/generate
 * 生成图片（同步调用阿里云百炼 Z-Image Turbo）
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

    const claimFilter = { nano_id: promptNanoId, state: 'GENERATING', request_id: null };
    async function replay() {
        const saved = await db.trail.findFirst({ where: { nano_id: promptNanoId } });
        if (saved?.state === 'SUCCESS') {
            return NextResponse.json(
                saved.image_url
                    ? { msg: '发布成功', url: saved.image_url, prompt: saved.generate_prompt }
                    : { msg: '不需要生成图片' }
            );
        }
        if (saved?.state === 'GENERATING') {
            return NextResponse.json({ msg: '图片生成中' }, { status: 202 });
        }
        return NextResponse.json({ msg: '生成任务已结束' }, { status: 409 });
    }
    if (trail.request_id || trail.state !== 'GENERATING') return replay();

    logger.info({ promptNanoId, picMode }, '图像模式检查');
    if (!picMode) {
        const finished = await db.trail.updateMany({
            where: claimFilter,
            data: { state: 'SUCCESS' },
        });
        if (!finished.count) return replay();
        return NextResponse.json({ msg: '不需要生成图片' });
    }

    // 并行获取意图画像和上下文摘要
    const templateContent = (engine.template as any)?.prompt || '';
    const [setting, experiment, userExpContext] = await Promise.all([
        db.platform_setting.findUnique({ where: { id: 1 }, select: { image_size: true } }),
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

    const claimed = await db.trail.updateMany({
        where: claimFilter,
        data: { request_id: promptNanoId },
    });
    if (!claimed.count) return replay();

    try {
        const side = setting?.image_size ?? DEFAULT_IMAGE_SIZE;
        const imageUrl = await generateImage(assembledPrompt, size ?? `${side}x${side}`);
        await db.trail.update({
            where: { nano_id: promptNanoId },
            data: {
                state: 'SUCCESS',
                image_url: imageUrl,
                archive_retry_at: new Date(Date.now() + 2 * 60000),
                generate_prompt: assembledPrompt,
                update_time: new Date(),
            },
        });

        after(() => archiveImage(promptNanoId, imageUrl));
        after(async () => {
            try {
                const previous = userExpContext?.context_summary ?? null;
                const summary = await updateContextSummary(trail.prompt!, previous);
                await db.user_experiments.updateMany({
                    where: { id: userExperiment.id, context_summary: previous },
                    data: { context_summary: summary },
                });
            } catch {
                logger.warn({ promptNanoId }, '上下文摘要更新失败');
            }
        });

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
            url: imageUrl,
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
            await db.trail.updateMany({
                where: { nano_id: promptNanoId, state: 'GENERATING', request_id: promptNanoId },
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
