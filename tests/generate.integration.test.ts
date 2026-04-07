/**
 * Doubao API 集成测试
 *
 * 需要在 .env.local 中配置 ARK_API_KEY 才能运行。
 * OSS 转存测试额外需要配置 OSS_BUCKET、ACCESS_KEY_ID 等环境变量。
 *
 * 运行方式：
 *   npx vitest run tests/generate.integration.test.ts --reporter=verbose
 */
import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';
import { generateImage } from '../src/lib/generate';

// 使用 createRequire 加载 CJS 模块（避免 upload.js 的混写模块问题）
const _require = createRequire(import.meta.url);
const OSS = _require('ali-oss');

const hasApiKey = Boolean(process.env.ARK_API_KEY);
const hasOssConfig = Boolean(
    process.env.OSS_BUCKET &&
        process.env.ACCESS_KEY_ID &&
        process.env.ACCESS_KEY_SECRET &&
        process.env.OSS_REGION
);

describe.skipIf(!hasApiKey)('Doubao API 集成测试（需要 ARK_API_KEY）', () => {
    it('应成功生成图片并返回有效 HTTPS URL', async () => {
        const url = await generateImage('一只橘猫坐在窗台上，阳光照射，写实风格');

        expect(url).toBeTruthy();
        expect(typeof url).toBe('string');
        expect(url).toMatch(/^https?:\/\//);

        console.log('[集成测试] 生成图片 URL:', url);
    }, 90000);

    it('支持风格拼接的提示词格式', async () => {
        const prompt = '风格：噪点渐变插画，内容：夜晚城市天际线';
        const url = await generateImage(prompt);

        expect(url).toBeTruthy();
        expect(url).toMatch(/^https?:\/\//);

        console.log('[集成测试] 风格拼接提示词生成 URL:', url);
    }, 90000);

    it('超长提示词不应导致崩溃', async () => {
        const longPrompt = '一只猫。'.repeat(50);
        const url = await generateImage(longPrompt);

        expect(url).toMatch(/^https?:\/\//);
    }, 90000);
});

describe.skipIf(!hasApiKey || !hasOssConfig)('OSS 转存集成测试（需要 ARK_API_KEY + OSS 配置）', () => {
    it('应生成图片并成功转存到 OSS，返回 OSS 域名地址', async () => {
        // 1. 生成图片，获取 Doubao 临时 URL
        const doubaoUrl = await generateImage('一朵向日葵，水彩画风格');
        expect(doubaoUrl).toMatch(/^https?:\/\//);

        // 2. 下载图片
        const imgBuffer = Buffer.from(await fetch(doubaoUrl).then((r) => r.arrayBuffer()));
        expect(imgBuffer.length).toBeGreaterThan(0);

        // 3. 上传到 OSS
        const ossClient = new OSS({
            region: process.env.OSS_REGION,
            accessKeyId: process.env.ACCESS_KEY_ID,
            accessKeySecret: process.env.ACCESS_KEY_SECRET,
            bucket: process.env.OSS_BUCKET,
            endpoint: process.env.ENDPOINT,
        });

        const ossPath = `trail/test-${Date.now()}.png`;
        const result = await ossClient.put(ossPath, imgBuffer);

        console.log('[集成测试] Doubao URL:', doubaoUrl.substring(0, 80) + '...');
        console.log('[集成测试] OSS URL:', result.url);

        // 4. 验证 OSS URL
        expect(result.url).toBeTruthy();
        expect(result.url).toMatch(/^https?:\/\//);
        expect(result.url).toContain(process.env.OSS_BUCKET);
    }, 90000);
});

describe.skipIf(hasApiKey)('集成测试跳过提示', () => {
    it('未配置 ARK_API_KEY，跳过集成测试', () => {
        console.warn(
            '[集成测试] 跳过：请在 .env.local 中设置 ARK_API_KEY 以运行真实 API 测试。'
        );
        expect(true).toBe(true);
    });
});
