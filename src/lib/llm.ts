import OpenAI from 'openai';
import { logger } from './logger';

require('dotenv').config();

let _client: OpenAI | null = null;

function getClient(): OpenAI {
    if (!_client) {
        _client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return _client;
}

const PRIMARY_MODEL = process.env.OPENAI_TEXT_MODEL || 'gpt-5.4-nano';
const FALLBACK_MODEL = 'gpt-4.1-nano';
const TEXT_TIMEOUT = 15000; // 15 秒

/**
 * 调用 OpenAI 文本 LLM（chat completions）
 * 主模型：gpt-5.4-nano，失败时自动降级到 gpt-4.1-nano
 */
export async function chatCompletion(
    systemPrompt: string,
    userMessage: string,
    options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
    try {
        return await callModel(PRIMARY_MODEL, systemPrompt, userMessage, options);
    } catch (primaryError) {
        logger.warn(
            { model: PRIMARY_MODEL, error: String(primaryError) },
            '主模型调用失败，降级到备用模型'
        );
        return await callModel(FALLBACK_MODEL, systemPrompt, userMessage, options);
    }
}

async function callModel(
    model: string,
    systemPrompt: string,
    userMessage: string,
    options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
    const startTime = Date.now();
    logger.info({ model, msgLen: userMessage.length }, '开始调用 OpenAI 文本 LLM');

    try {
        const response = await getClient().chat.completions.create(
            {
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage },
                ],
                temperature: options?.temperature ?? 0.3,
                max_completion_tokens: options?.maxTokens ?? 500,
            },
            { signal: AbortSignal.timeout(TEXT_TIMEOUT) }
        );

        const content = response.choices[0]?.message?.content?.trim() || '';
        const elapsed = Date.now() - startTime;
        logger.info({ model, elapsed, contentLen: content.length }, 'OpenAI 文本 LLM 调用成功');
        return content;
    } catch (error) {
        const elapsed = Date.now() - startTime;
        if (error instanceof Error && error.name === 'TimeoutError') {
            logger.error({ model, elapsed, timeout: TEXT_TIMEOUT }, 'OpenAI 文本 LLM 调用超时');
            throw new Error(`文本 LLM 调用超时 (${model})`);
        }
        logger.error({ model, error: String(error), elapsed }, 'OpenAI 文本 LLM 调用失败');
        throw error;
    }
}
