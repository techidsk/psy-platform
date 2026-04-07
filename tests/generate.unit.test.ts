import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted 确保变量在 vi.mock 提升时已可用
const mockImagesGenerate = vi.hoisted(() => vi.fn());

vi.mock('openai', () => ({
    default: class MockOpenAI {
        images = { generate: mockImagesGenerate };
    },
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

import { generateImage } from '../src/lib/generate';

describe('generateImage 单元测试', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('成功时返回图片 URL', async () => {
        const mockUrl = 'https://example.com/generated-image.png';
        mockImagesGenerate.mockResolvedValueOnce({
            data: [{ url: mockUrl }],
        });

        const result = await generateImage('一只可爱的橘猫');
        expect(result).toBe(mockUrl);
        expect(mockImagesGenerate).toHaveBeenCalledOnce();
    });

    it('size 参数默认为 1024x1024', async () => {
        mockImagesGenerate.mockResolvedValueOnce({
            data: [{ url: 'https://example.com/image.png' }],
        });

        await generateImage('测试提示词');
        expect(mockImagesGenerate).toHaveBeenCalledWith(
            expect.objectContaining({ size: '1024x1024' }),
            expect.anything()
        );
    });

    it('支持自定义 size 参数', async () => {
        mockImagesGenerate.mockResolvedValueOnce({
            data: [{ url: 'https://example.com/image.png' }],
        });

        await generateImage('测试提示词', '512x512');
        expect(mockImagesGenerate).toHaveBeenCalledWith(
            expect.objectContaining({ size: '512x512' }),
            expect.anything()
        );
    });

    it('API 返回空 data 数组时抛出错误', async () => {
        mockImagesGenerate.mockResolvedValueOnce({ data: [] });

        await expect(generateImage('测试提示词')).rejects.toThrow('Doubao API 未返回图片 URL');
    });

    it('API 返回 null URL 时抛出错误', async () => {
        mockImagesGenerate.mockResolvedValueOnce({ data: [{ url: null }] });

        await expect(generateImage('测试提示词')).rejects.toThrow('Doubao API 未返回图片 URL');
    });

    it('API 返回 undefined data 时抛出错误', async () => {
        mockImagesGenerate.mockResolvedValueOnce({ data: undefined });

        await expect(generateImage('测试提示词')).rejects.toThrow('Doubao API 未返回图片 URL');
    });

    it('API 调用失败时透传错误', async () => {
        const networkError = new Error('connection refused');
        mockImagesGenerate.mockRejectedValueOnce(networkError);

        await expect(generateImage('测试提示词')).rejects.toThrow('connection refused');
    });

    it('超时错误被包装为中文提示', async () => {
        const timeoutError = Object.assign(new Error('The operation was aborted'), {
            name: 'TimeoutError',
        });
        mockImagesGenerate.mockRejectedValueOnce(timeoutError);

        await expect(generateImage('测试提示词')).rejects.toThrow('图片生成超时');
    });

    it('提示词正确传递到 API', async () => {
        const prompt = '风格：噪点渐变插画，内容：一只猫';
        mockImagesGenerate.mockResolvedValueOnce({
            data: [{ url: 'https://example.com/image.png' }],
        });

        await generateImage(prompt);
        expect(mockImagesGenerate).toHaveBeenCalledWith(
            expect.objectContaining({ prompt }),
            expect.anything()
        );
    });
});
