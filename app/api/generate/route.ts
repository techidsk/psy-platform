import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { generate } from '@/lib/generate';
import { OpenAIClient, AzureKeyCredential, ChatRequestMessage } from '@azure/openai';
import { getCurrentUser } from '@/lib/session';
import { AGES_MAP, GENDER_MAP } from '@/common/user';
import { logger } from '@/lib/logger';

require('dotenv').config();
const endpoint = process.env.OPENAI_ENDPOINT || '';
const azureApiKey = process.env.OPENAI_API_KEY || '';

function getValueFromObj(key: number, map: object) {
    for (const [k, v] of Object.entries(map)) {
        if (parseInt(k) === key) {
            return v;
        }
    }
    return '';
}

/**
 * 使用OpenAI翻譯提示词
 *
 * @param {string} systemPrompt - The system prompt.
 * @param {string} userPrompt - The messages to be translated.
 * @returns {Promise<string>} - The translated message.
 */
async function translate(systemPrompt: string, userPrompt: string): Promise<string> {
    const messages: ChatRequestMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ];
    const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey));
    const deploymentId = '0605chatgpt';
    const result = await client.getChatCompletions(deploymentId, messages);
    return result?.choices[0]?.message?.content ?? '';
}

/**
 * /api/generate
 * 翻译提示词并生成图片
 *
 * @returns
 */
export async function POST(request: Request) {
    const currentUser = await getCurrentUser();
    const user = currentUser?.id
        ? await db.user.findFirst({ where: { id: parseInt(currentUser.id) } })
        : undefined;

    const json = await request.json();

    const isGuest: boolean = Boolean(json?.guest);
    const promptNanoId: string = json?.id;
    const experimentId: string = json?.experimentId;
    const experimentNanoId: string = json?.experimentNanoId;

    if (!promptNanoId) {
        logger.error('未找到对应promptNanoId数据');
        return;
    }

    const data = await db.trail.findFirst({
        where: { nano_id: promptNanoId },
    });

    if (!data) {
        logger.error('未找到对应trail数据');
        return;
    }

    if (!data.prompt) {
        logger.error('未找到对应prompt数据');
        return;
    }

    logger.info(`${isGuest ? 'Guest模式' : '普通用户模式'}`);
    logger.info(json);
    let userExperiment = await db.user_experiments.findFirst({
        where: { nano_id: isGuest ? experimentNanoId : experimentId },
    });

    if (!userExperiment || !userExperiment.experiment_id) {
        logger.error('未找到对应userExperiment数据');
        return;
    }

    const engineId = userExperiment.engine_id;
    if (!engineId) {
        logger.error('未找到对应engine_id数据');
        return;
    }

    // 获取生成信息
    const engine = await db.engine.findFirst({
        where: { id: engineId },
    });

    if (!engine) {
        logger.error('未找到对应engine数据');
        return;
    }

    if (!engine.engine_description) {
        logger.error('未找到对应engine_description数据');
        return;
    }

    const userPrompts = await db.trail.findMany({
        where: { user_id: data.user_id, user_experiment_id: data.user_experiment_id },
        select: { prompt: true, generate_prompt: true },
        orderBy: { create_time: 'desc' },
        take: 5,
    });

    const generateData = {
        user_prompts: userPrompts,
        engine_id: engine.id,
        gpt: {
            gpt_prompt: engine.gpt_prompt,
            gpt_setting: engine.gpt_settings,
        },
        template: engine.template,
        user: {
            gender: (user?.gender && getValueFromObj(user.gender, GENDER_MAP)) || '',
            ages: (user?.ages && getValueFromObj(user.ages, AGES_MAP)) || '',
        },
    };
    const experiment = await db.experiment.findFirst({
        where: { id: parseInt(userExperiment.experiment_id) },
    });
    if (!experiment) {
        logger.error('未找到对应experiment数据');
        return;
    }

    // 是否开启生成图片模式
    let imageUrl = '';
    let prompt = '';
    // TODO 图片模式 pic_mode
    const response = await generate(generateData);
    logger.info(response);
    imageUrl = response?.image_url;
    prompt = response?.chat_result;
    if (imageUrl) {
        logger.info(`生成图片url: ${imageUrl}`);
        return NextResponse.json({ msg: '发布成功', url: imageUrl, prompt: prompt });
    } else {
        await db.trail.update({
            where: { nano_id: promptNanoId },
            data: { state: 'FAILED' },
        });
        const body = JSON.stringify({ msg: '发布失败' });
        const res = new Response(body, {
            status: 401,
            statusText: 'Unauthorized',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return res;
    }
}
