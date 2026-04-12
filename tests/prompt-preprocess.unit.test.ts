import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/llm', () => ({
    chatCompletion: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

vi.mock('@/lib/db', () => ({
    db: {
        experiment: { findFirst: vi.fn(), update: vi.fn() },
        experiment_steps: { findMany: vi.fn() },
    },
}));

import { chatCompletion } from '@/lib/llm';
import {
    assemblePrompt,
    analyzeExperimentIntent,
    updateContextSummary,
} from '../src/lib/prompt-preprocess';

const mockChat = vi.mocked(chatCompletion);

// ============================================================
// assemblePrompt（纯拼接，无 LLM）
// ============================================================

describe('assemblePrompt', () => {
    it('基本拼接：风格 + 内容', () => {
        expect(
            assemblePrompt({
                userInput: '一只猫在草地上',
                intentProfile: null,
                contextSummary: null,
                styleTemplate: '水彩画风格',
            })
        ).toBe('风格：水彩画风格，内容：一只猫在草地上');
    });

    it('无风格时只有内容', () => {
        expect(
            assemblePrompt({
                userInput: '一只猫在草地上',
                intentProfile: null,
                contextSummary: null,
                styleTemplate: '',
            })
        ).toBe('内容：一只猫在草地上');
    });

    it('完整拼接：风格 + 内容 + 背景 + 指导', () => {
        const intentProfile = JSON.stringify({
            purpose: '测试',
            emotional_direction: '积极',
            image_guidance: '图片应温暖明亮',
            keywords: ['测试'],
        });
        expect(
            assemblePrompt({
                userInput: '阳光下的花朵',
                intentProfile,
                contextSummary: '春天的田野',
                styleTemplate: '油画风格',
            })
        ).toBe('风格：油画风格，内容：阳光下的花朵，背景：春天的田野，指导：图片应温暖明亮');
    });

    it('拼接顺序：风格 → 内容 → 背景 → 指导', () => {
        const intentProfile = JSON.stringify({ purpose: '测试', image_guidance: '指导' });
        const parts = assemblePrompt({
            userInput: '输入',
            intentProfile,
            contextSummary: '背景',
            styleTemplate: '风格',
        }).split('，');
        expect(parts[0]).toMatch(/^风格：/);
        expect(parts[1]).toMatch(/^内容：/);
        expect(parts[2]).toMatch(/^背景：/);
        expect(parts[3]).toMatch(/^指导：/);
    });

    it('intent_profile 解析失败时跳过指导', () => {
        expect(
            assemblePrompt({
                userInput: '测试',
                intentProfile: '非JSON',
                contextSummary: null,
                styleTemplate: '风格',
            })
        ).toBe('风格：风格，内容：测试');
    });

    it('intent_profile 缺少 image_guidance 时跳过指导', () => {
        expect(
            assemblePrompt({
                userInput: '测试',
                intentProfile: JSON.stringify({ purpose: '测试' }),
                contextSummary: null,
                styleTemplate: '风格',
            })
        ).toBe('风格：风格，内容：测试');
    });

    it('所有可选为 null 时退化为仅内容（兼容旧行为）', () => {
        expect(
            assemblePrompt({
                userInput: '一只猫',
                intentProfile: null,
                contextSummary: null,
                styleTemplate: '',
            })
        ).toBe('内容：一只猫');
    });
});

// ============================================================
// updateContextSummary
// ============================================================

describe('updateContextSummary', () => {
    beforeEach(() => {
        mockChat.mockReset();
    });

    it('短文本无历史 → 直接返回，不调 LLM', async () => {
        expect(await updateContextSummary('一只猫', null)).toBe('一只猫');
        expect(mockChat).not.toHaveBeenCalled();
    });

    it('短文本有短历史 → 直接拼接，不调 LLM', async () => {
        expect(await updateContextSummary('在草地上', '一只猫')).toBe('一只猫；在草地上');
        expect(mockChat).not.toHaveBeenCalled();
    });

    it('当前输入 ≥50 字 → 调 LLM 压缩', async () => {
        mockChat.mockResolvedValueOnce('用户描述了复杂的春天场景');
        const longText = '一'.repeat(60); // 60 字，超过 50 字阈值
        expect(await updateContextSummary(longText, null)).toBe('用户描述了复杂的春天场景');
        expect(mockChat).toHaveBeenCalledOnce();
    });

    it('累积长度 ≥100 字 → 调 LLM 压缩', async () => {
        mockChat.mockResolvedValueOnce('压缩后的摘要');
        const existing = '摘'.repeat(90); // 90 字
        const input = '新'.repeat(15); // 15 字，合计 105 > 100
        expect(await updateContextSummary(input, existing)).toBe('压缩后的摘要');
        expect(mockChat).toHaveBeenCalledOnce();
    });
});

// ============================================================
// analyzeExperimentIntent
// ============================================================

describe('analyzeExperimentIntent', () => {
    beforeEach(() => {
        mockChat.mockReset();
    });

    it('无描述和步骤 → 返回默认画像，不调 LLM', async () => {
        const parsed = JSON.parse(
            await analyzeExperimentIntent({ description: null, intro: null, steps: [] })
        );
        expect(parsed.purpose).toBe('通用心理学实验');
        expect(parsed.image_guidance).toBeTruthy();
        expect(mockChat).not.toHaveBeenCalled();
    });

    it('有描述 → 调 LLM 分析并返回结构化结果', async () => {
        const profile = {
            purpose: '探究情绪影响',
            emotional_direction: '积极',
            image_guidance: '温暖明亮',
            keywords: ['情绪'],
        };
        mockChat.mockResolvedValueOnce(JSON.stringify(profile));

        const parsed = JSON.parse(
            await analyzeExperimentIntent({ description: '探究积极情绪', intro: null, steps: [] })
        );
        expect(parsed.purpose).toBe('探究情绪影响');
        expect(parsed.image_guidance).toBe('温暖明亮');
        expect(mockChat).toHaveBeenCalledOnce();
    });

    it('LLM 返回 markdown 代码块 → 也能解析', async () => {
        const profile = {
            purpose: '测试实验',
            emotional_direction: '自由',
            image_guidance: '测试指导',
            keywords: ['测试'],
        };
        mockChat.mockResolvedValueOnce('```json\n' + JSON.stringify(profile) + '\n```');

        const parsed = JSON.parse(
            await analyzeExperimentIntent({ description: '测试', intro: null, steps: [] })
        );
        expect(parsed.purpose).toBe('测试实验');
    });

    it('包含步骤信息 → 一并发送给 LLM', async () => {
        const profile = {
            purpose: '写作',
            emotional_direction: '自由',
            image_guidance: '配图',
            keywords: ['写作'],
        };
        mockChat.mockResolvedValueOnce(JSON.stringify(profile));

        await analyzeExperimentIntent({
            description: '写作实验',
            intro: '自由写作',
            steps: [
                { title: '自由写作', content: { content: '请写一段关于春天的文字' } },
                { title: '总结', content: { content: '请总结你的感受' } },
            ],
        });

        const userMsg = mockChat.mock.calls[0][1];
        expect(userMsg).toContain('写作实验');
        expect(userMsg).toContain('春天');
    });

    it('LLM 返回无效内容 → 抛出错误', async () => {
        mockChat.mockResolvedValueOnce('这完全不是JSON也不包含花括号');
        await expect(
            analyzeExperimentIntent({ description: '测试', intro: null, steps: [] })
        ).rejects.toThrow('无法解析意图分析结果');
    });
});
