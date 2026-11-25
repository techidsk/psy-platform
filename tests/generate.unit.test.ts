import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.hoisted(() => vi.fn());

vi.stubGlobal('fetch', mockFetch);

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

import { generateImage } from '../src/lib/generate';

function jsonResponse(body: unknown, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => body,
    };
}

function imageResponse(url: string | null) {
    return jsonResponse({
        output: {
            choices: [{ message: { content: url ? [{ image: url }] : [{ image: null }] } }],
        },
    });
}

function requestBody() {
    return JSON.parse(mockFetch.mock.calls[0][1].body as string);
}

describe('generateImage 单元测试', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.DASHSCOPE_API_KEY = 'test-key';
        process.env.DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/api/v1';
    });

    it('成功时返回图片 URL', async () => {
        const mockUrl = 'https://example.com/generated-image.png';
        mockFetch.mockResolvedValueOnce(imageResponse(mockUrl));

        const result = await generateImage('一只可爱的橘猫');
        expect(result).toBe(mockUrl);
        expect(mockFetch).toHaveBeenCalledOnce();
        expect(requestBody()).toMatchObject({
            model: 'z-image-turbo',
            input: { messages: [{ role: 'user', content: [{ text: '一只可爱的橘猫' }] }] },
            parameters: { size: '512*512', prompt_extend: false },
        });
    });

    it('size 参数默认转换为 512*512', async () => {
        mockFetch.mockResolvedValueOnce(imageResponse('https://example.com/image.png'));

        await generateImage('测试提示词');
        expect(requestBody().parameters.size).toBe('512*512');
    });

    it('支持自定义 size 参数', async () => {
        mockFetch.mockResolvedValueOnce(imageResponse('https://example.com/image.png'));

        await generateImage('测试提示词', '512x512');
        expect(requestBody().parameters.size).toBe('512*512');
    });

    it('API 返回空 content 时抛出错误', async () => {
        mockFetch.mockResolvedValueOnce(
            jsonResponse({ output: { choices: [{ message: { content: [] } }] } })
        );

        await expect(generateImage('测试提示词')).rejects.toThrow('百炼 API 未返回图片 URL');
    });

    it('API 返回 null URL 时抛出错误', async () => {
        mockFetch.mockResolvedValueOnce(imageResponse(null));

        await expect(generateImage('测试提示词')).rejects.toThrow('百炼 API 未返回图片 URL');
    });

    it('API 返回缺少 output 时抛出错误', async () => {
        mockFetch.mockResolvedValueOnce(jsonResponse({}));

        await expect(generateImage('测试提示词')).rejects.toThrow('百炼 API 未返回图片 URL');
    });

    it('API 调用失败时透传错误', async () => {
        const networkError = new Error('connection refused');
        mockFetch.mockRejectedValueOnce(networkError);

        await expect(generateImage('测试提示词')).rejects.toThrow('connection refused');
    });

    it('超时错误被包装为中文提示', async () => {
        const timeoutError = Object.assign(new Error('The operation was aborted'), {
            name: 'TimeoutError',
        });
        mockFetch.mockRejectedValueOnce(timeoutError);

        await expect(generateImage('测试提示词')).rejects.toThrow('图片生成超时');
    });

    it('提示词正确传递到 API', async () => {
        const prompt = '风格：噪点渐变插画，内容：一只猫';
        mockFetch.mockResolvedValueOnce(imageResponse('https://example.com/image.png'));

        await generateImage(prompt);
        const body = requestBody();
        expect(body.input.messages[0].content).toEqual([{ text: prompt }]);
        expect(mockFetch.mock.calls[0][0]).toBe(
            'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'
        );
    });

    it('接口返回业务错误码时抛出错误', async () => {
        mockFetch.mockResolvedValueOnce(
            jsonResponse({ code: 'InvalidParameter', message: 'size invalid' }, 400)
        );

        await expect(generateImage('测试提示词')).rejects.toThrow('百炼图片生成失败: size invalid');
    });

    it('非法尺寸在出网前拒绝', async () => {
        await expect(generateImage('测试提示词', '100x100')).rejects.toThrow('图片尺寸不合法');
        expect(mockFetch).not.toHaveBeenCalled();
    });
});
