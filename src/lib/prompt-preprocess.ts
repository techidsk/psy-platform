import { chatCompletion } from './llm';
import { db } from './db';
import { logger } from './logger';

// ============================================================
// 类型定义
// ============================================================

interface ExperimentIntentProfile {
    purpose: string;
    emotional_direction: string;
    image_guidance: string;
    keywords: string[];
}

interface StepInfo {
    title?: string | null;
    content?: unknown;
}

// ============================================================
// 异步环节 1：实验意图分析（实验保存时触发）
// ============================================================

const INTENT_ANALYSIS_SYSTEM_PROMPT = `你是一个心理学实验分析助手。请分析以下心理学实验的核心目的和意图，输出一个严格的 JSON 对象，包含以下字段：
- purpose: 一句话描述实验核心目的（不超过50字）
- emotional_direction: 实验期望引导参与者的情绪方向（如：积极表达、自由探索、情绪宣泄等）
- image_guidance: 当参与者输入文字后生成图片时，应遵循的视觉指导原则（不超过80字）
- keywords: 3-5个关键词的数组

只输出 JSON，不要包含任何其他文字或 markdown 格式标记。`;

/**
 * 分析实验意图，生成结构化的意图画像
 */
export async function analyzeExperimentIntent(params: {
    description?: string | null;
    intro?: string | null;
    steps: StepInfo[];
}): Promise<string> {
    const parts: string[] = [];

    if (params.description) {
        parts.push(`实验描述：${params.description}`);
    }
    if (params.intro) {
        parts.push(`项目介绍：${params.intro}`);
    }

    if (params.steps.length > 0) {
        const stepDescriptions = params.steps
            .map((step, i) => {
                const title = step.title || '';
                const content =
                    typeof step.content === 'object' && step.content !== null
                        ? (step.content as Record<string, unknown>).content || ''
                        : '';
                return `步骤${i + 1}：${title} ${content}`.trim();
            })
            .filter((s) => s.length > 5);

        if (stepDescriptions.length > 0) {
            parts.push(`实验步骤：\n${stepDescriptions.join('\n')}`);
        }
    }

    if (parts.length === 0) {
        return JSON.stringify({
            purpose: '通用心理学实验',
            emotional_direction: '自由探索',
            image_guidance: '根据用户描述生成匹配意境的图片',
            keywords: ['心理实验'],
        });
    }

    const userMessage = parts.join('\n\n');
    const result = await chatCompletion(INTENT_ANALYSIS_SYSTEM_PROMPT, userMessage);

    // 验证返回的是有效 JSON
    try {
        const parsed = JSON.parse(result) as ExperimentIntentProfile;
        if (!parsed.purpose || !parsed.image_guidance) {
            throw new Error('缺少必要字段');
        }
        return result;
    } catch {
        logger.warn({ result: result.substring(0, 200) }, '意图分析结果不是有效 JSON，尝试提取');
        // 尝试从 markdown 代码块中提取 JSON
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const extracted = JSON.parse(jsonMatch[0]);
            return JSON.stringify(extracted);
        }
        throw new Error('无法解析意图分析结果');
    }
}

/**
 * 分析实验意图并保存到数据库（供 API 路由调用的便捷函数）
 */
export async function analyzeAndSaveIntentProfile(experimentNanoId: string): Promise<void> {
    const experiment = await db.experiment.findFirst({
        where: { nano_id: experimentNanoId },
        select: { id: true, description: true, intro: true },
    });

    if (!experiment) {
        logger.warn({ experimentNanoId }, '意图分析：未找到实验');
        return;
    }

    const steps = await db.experiment_steps.findMany({
        where: { experiment_id: experiment.id },
        select: { title: true, content: true },
        orderBy: { order: 'asc' },
    });

    const intentProfile = await analyzeExperimentIntent({
        description: experiment.description,
        intro: experiment.intro,
        steps,
    });

    await db.experiment.update({
        where: { id: experiment.id },
        data: { intent_profile: intentProfile },
    });

    logger.info({ experimentNanoId }, '意图画像已保存');
}

// ============================================================
// 异步环节 2：上下文增量压缩（生成完成后触发）
// ============================================================

const CONTEXT_SUMMARY_SYSTEM_PROMPT = `你是一个上下文压缩助手。根据用户的新输入和已有的上下文摘要，生成一个更新后的摘要。
摘要应捕捉用户的整体表达方向和核心意象，帮助后续图片生成理解用户的连续创作意图。
控制在100字以内。只输出摘要本身，不要包含任何解释或前缀。`;

// 短文本阈值：低于此长度的输入直接追加，不走 LLM
const SHORT_TEXT_THRESHOLD = 50;

/**
 * 增量更新上下文摘要
 *
 * 策略：
 * - 如果当前输入较短（<50字）且累积摘要也不长，直接追加，不调 LLM
 * - 如果累积文本较长或需要压缩，才调用 LLM 做意图识别和压缩
 *
 * @param currentPrompt 当前用户输入
 * @param existingSummary 已有的上下文摘要（可为 null）
 * @returns 更新后的摘要字符串
 */
export async function updateContextSummary(
    currentPrompt: string,
    existingSummary: string | null
): Promise<string> {
    const combinedLength = (existingSummary?.length || 0) + currentPrompt.length;

    // 短文本直接拼接，不走 LLM
    if (currentPrompt.length < SHORT_TEXT_THRESHOLD && combinedLength < SHORT_TEXT_THRESHOLD * 2) {
        return existingSummary ? `${existingSummary}；${currentPrompt}` : currentPrompt;
    }

    // 长文本或累积过长，调用 LLM 压缩
    const userMessage = existingSummary
        ? `已有摘要：${existingSummary}\n\n用户新输入：${currentPrompt}`
        : `用户输入：${currentPrompt}`;

    return chatCompletion(CONTEXT_SUMMARY_SYSTEM_PROMPT, userMessage, {
        maxTokens: 200,
    });
}

// ============================================================
// 运行时：提示词拼接（纯模板，无 LLM 调用）
// ============================================================

/**
 * 组装最终的图片生成提示词（纯字符串操作，毫秒级）
 *
 * 拼接顺序：风格 + 当前用户输入 + 上下文摘要
 * 意图画像作为隐式指导融入风格和上下文中，不单独暴露
 */
// Doubao seedream 提示词最大长度（字符数），超出会被截断
const MAX_PROMPT_LENGTH = 800;

export function assemblePrompt(params: {
    userInput: string;
    intentProfile: string | null;
    contextSummary: string | null;
    styleTemplate: string;
}): string {
    const parts: string[] = [];

    // 1. 风格模板
    if (params.styleTemplate) {
        parts.push(`风格：${params.styleTemplate}`);
    }

    // 2. 当前用户输入（完整保留，优先级最高）
    parts.push(`内容：${params.userInput}`);

    // 3. 上下文摘要（已压缩的历史背景）
    if (params.contextSummary) {
        parts.push(`背景：${params.contextSummary}`);
    }

    // 4. 实验意图指导（从预分析中提取 image_guidance，作为补充）
    let imageGuidance: string | null = null;
    if (params.intentProfile) {
        try {
            const profile = JSON.parse(params.intentProfile) as ExperimentIntentProfile;
            if (profile.image_guidance) {
                imageGuidance = profile.image_guidance;
                parts.push(`指导：${imageGuidance}`);
            }
        } catch {
            // ignore parse errors, skip intent guidance
        }
    }

    const assembled = parts.join('，');

    // 记录各组成部分，方便调试
    logger.info(
        {
            style: params.styleTemplate || '(空)',
            userInput: params.userInput,
            contextSummary: params.contextSummary || '(空)',
            imageGuidance: imageGuidance || '(空)',
            assembledLength: assembled.length,
            assembled,
        },
        '提示词组装详情'
    );

    // 超长截断，保留完整的最后一个中文句子
    if (assembled.length > MAX_PROMPT_LENGTH) {
        const truncated = assembled.substring(0, MAX_PROMPT_LENGTH);
        logger.warn(
            {
                originalLength: assembled.length,
                truncatedLength: truncated.length,
                maxLength: MAX_PROMPT_LENGTH,
            },
            `提示词超长，已截断 (${assembled.length} → ${truncated.length})`
        );
        return truncated;
    }

    return assembled;
}
