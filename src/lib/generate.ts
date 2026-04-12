import OpenAI from 'openai';
import { logger } from './logger';

require('dotenv').config();

const client = new OpenAI({
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    apiKey: process.env.ARK_API_KEY,
});

const DOUBAO_MODEL = 'doubao-seedream-3-0-t2i-250415';
const DEFAULT_SIZE = '1024x1024';
const GENERATE_TIMEOUT = 60000; // 60 秒

/**
 * 调用 Doubao 图片生成 API
 * @param prompt 生成提示词
 * @param size 图片尺寸，默认 1024x1024
 * @returns 生成图片的 URL
 */
async function generateImage(prompt: string, size: string = DEFAULT_SIZE): Promise<string> {
    const startTime = Date.now();
    logger.info({ promptLength: prompt.length, prompt, size }, '开始调用 Doubao 生成图片');
    try {
        const response = await client.images.generate(
            {
                model: DOUBAO_MODEL,
                prompt,
                size: size as any,
                response_format: 'url',
                watermark: false,
            } as any,
            { signal: AbortSignal.timeout(GENERATE_TIMEOUT) }
        );
        const url = response.data?.[0]?.url;
        if (!url) {
            throw new Error('Doubao API 未返回图片 URL');
        }
        const elapsed = Date.now() - startTime;
        logger.info({ url: url.substring(0, 80), elapsed }, 'Doubao 生成成功');
        return url;
    } catch (error) {
        const elapsed = Date.now() - startTime;
        if (error instanceof Error && error.name === 'TimeoutError') {
            logger.error({ elapsed, timeout: GENERATE_TIMEOUT }, 'Doubao 生成超时');
            throw new Error('图片生成超时');
        }
        logger.error({ error: String(error), elapsed }, 'Doubao 生成失败');
        throw error;
    }
}

export { generateImage };
