import { logger } from './logger';

require('dotenv').config();

const MODEL = 'z-image-turbo';
const DEFAULT_SIZE = '1024x1024';
const GENERATE_TIMEOUT = 60000;
const DEFAULT_BASE_URL = 'https://dashscope.aliyuncs.com/api/v1';
const MIN_PIXELS = 512 * 512;
const MAX_PIXELS = 2048 * 2048;
const MAX_PROMPT_LENGTH = 800;

function getConfig(): { apiKey: string; baseUrl: string } {
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) {
        throw new Error('未配置 DASHSCOPE_API_KEY');
    }
    const baseUrl = (process.env.DASHSCOPE_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
    return { apiKey, baseUrl };
}

/** 调用方沿用 1024x1024，百炼合同要求 宽*高，总像素落在 512² 到 2048²。 */
function toDashScopeSize(size: string): string {
    const normalized = size.trim().replace(/[xX]/, '*');
    const match = /^([1-9]\d+)\*([1-9]\d+)$/.exec(normalized);
    const pixels = match ? Number(match[1]) * Number(match[2]) : 0;
    if (!match || pixels < MIN_PIXELS || pixels > MAX_PIXELS) {
        throw new Error('图片尺寸不合法');
    }
    return normalized;
}

function normalizePrompt(prompt: string): string {
    const text = prompt.trim();
    if (!text) {
        throw new Error('提示词不能为空');
    }
    const chars = [...text];
    if (chars.length <= MAX_PROMPT_LENGTH) {
        return text;
    }
    logger.warn({ length: chars.length, max: MAX_PROMPT_LENGTH }, '提示词超过百炼上限，已截断');
    return chars.slice(0, MAX_PROMPT_LENGTH).join('');
}

/**
 * 调用阿里云百炼 Z-Image Turbo 文生图。
 * 只提交一段文本，关闭会改变单价的智能改写。
 */
async function generateImage(prompt: string, size: string = DEFAULT_SIZE): Promise<string> {
    const startTime = Date.now();
    const promptText = normalizePrompt(prompt);
    const dashSize = toDashScopeSize(size);
    const { apiKey, baseUrl } = getConfig();
    logger.info(
        { promptLength: promptText.length, prompt: promptText, size: dashSize, model: MODEL },
        '开始调用百炼生成图片'
    );
    try {
        const response = await fetch(`${baseUrl}/services/aigc/multimodal-generation/generation`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: MODEL,
                input: {
                    messages: [{ role: 'user', content: [{ text: promptText }] }],
                },
                parameters: { size: dashSize, prompt_extend: false },
            }),
            signal: AbortSignal.timeout(GENERATE_TIMEOUT),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || result?.code) {
            const message = result?.message || result?.code || `HTTP ${response.status}`;
            throw new Error(`百炼图片生成失败: ${message}`);
        }
        const content = result?.output?.choices?.[0]?.message?.content;
        const image = Array.isArray(content)
            ? content.find((item: { image?: unknown }) => typeof item?.image === 'string')?.image
            : undefined;
        if (typeof image !== 'string' || !/^https?:\/\//i.test(image)) {
            throw new Error('百炼 API 未返回图片 URL');
        }
        const elapsed = Date.now() - startTime;
        logger.info({ url: image.substring(0, 80), elapsed }, '百炼生成成功');
        return image;
    } catch (error) {
        const elapsed = Date.now() - startTime;
        if (error instanceof Error && error.name === 'TimeoutError') {
            logger.error({ elapsed, timeout: GENERATE_TIMEOUT }, '百炼生成超时');
            throw new Error('图片生成超时');
        }
        logger.error({ error: String(error), elapsed }, '百炼生成失败');
        throw error;
    }
}

export { generateImage };
