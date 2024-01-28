import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { generate } from '@/lib/generate';
import { nanoid } from 'nanoid';
import { OpenAIClient, AzureKeyCredential, ChatRequestMessage } from '@azure/openai';

require('dotenv').config();
const endpoint = process.env.OPENAI_ENDPOINT || '';
const azureApiKey = process.env.OPENAI_API_KEY || '';

/**
 * 使用OpenAI翻譯提示词
 *
 * TODO: 暂时只支持一句话，后需要增加上下文，并限制token数量
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
    const json = await request.json();
    const promptNanoId = json?.id;
    const experimentId = json?.experimentId;
    if (!promptNanoId) {
        console.error('未找到对应promptNanoId数据');
        return;
    }
    const data = await db.trail.findFirst({
        where: { nano_id: promptNanoId },
    });
    if (!data) {
        console.error('未找到对应trail数据');
        return;
    }
    if (!data.prompt) {
        console.error('未找到对应prompt数据');
        return;
    }
    const experiment = await db.experiment.findFirst({
        where: { nano_id: experimentId },
        select: { engine_id: true },
    });
    if (!experiment || !experiment.engine_id) {
        console.error('未找到对应experiment数据');
        return;
    }

    // 获取生成信息
    const engine = await db.engine.findFirst({
        where: { id: experiment.engine_id },
    });

    if (!engine) {
        console.error('未找到对应engine数据');
        return;
    }
    if (!engine.engine_description) {
        console.error('未找到对应engine_description数据');
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
        workflow: engine.workflow,
        template: engine.template,
    };

    console.log('用户已发送提示词', generateData);

    // TODO 修改成发送多条用户的提示词以及上下文
    let prompt = await translate(engine.gpt_prompt || '', data['prompt']);
    console.log('===============================================');
    console.log(`GPT的System指令：   \n${engine.gpt_prompt}`);
    console.log(`GPT翻譯結果：      \n ${prompt}`);
    console.log('===============================================');
    // 拼接生成提示词 将JSON转换成Object
    const templateJson = engine.template;
    const templateJsonString = JSON.stringify(templateJson);
    const template = JSON.parse(templateJsonString);
    let templateNegativePrompt = '';

    if (template) {
        const templatePrompt = template.prompt || '';
        templateNegativePrompt = template.negative_prompt || '';
        prompt = templatePrompt.replace(/{prompt}/g, prompt);
    }
    console.log(`生成提示词：\n${prompt}`);
    console.log(`生成负面提示词：\n${templateNegativePrompt}`);
    const response = await generate(prompt, templateNegativePrompt);
    const imageData = response?.data?.images;
    if (imageData.length > 0) {
        let imageUrl = imageData[0];
        console.log('生成图片url: ', imageUrl);
        return NextResponse.json({ msg: '发布成功', url: imageUrl });
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
