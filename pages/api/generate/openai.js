import { db } from '@/lib/db';
import { generate } from '@/lib/generate';
import { OpenAIClient, AzureKeyCredential } from "@azure/openai"

require('dotenv').config()
const endpoint = process.env.OPENAI_ENDPOINT
const azureApiKey = process.env.OPENAI_API_KEY


/**
 * Translates the given messages using OpenAI API.
 * @param {string} systemPrompt - The system prompt.
 * @param {string} userPrompt - The messages to be translated.
 * @returns {Promise<string>} - The translated message.
 */
async function translate(systemPrompt, userPrompt) {
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
    ]
    const client = new OpenAIClient(endpoint, new AzureKeyCredential(azureApiKey))
    const deploymentId = "0605chatgpt"
    const result = await client.getChatCompletions(deploymentId, messages)
    return result.choices[0].message.content
}


/**
 * @api {get} /api/generate/openai 生成图片
 * Handles the generation of an image based on a prompt and engine settings.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<Object|Response>} - A promise that resolves to a JSON object or a Response object.
 */
export default async function handler(
    req,
    res
) {
    console.log('----------- generate ------------');
    const promptNanoId = req?.query?.id;
    const engineId = req?.query?.engineId;
    if (!promptNanoId) {
        console.error('未找到对应promptNanoId数据')
        return
    }
    const data = await db.psy_trail.findFirst({
        where: { nano_id: promptNanoId }
    })
    if (!data) {
        console.error('未找到对应trail数据')
        return
    }
    // 生成图片并上传oss
    console.log(data['prompt']);
    let setting = await db.psy_engine.findFirst({
        where: { id: BigInt(engineId) }
    })

    let imageData = await generate(data['prompt'], setting.engine_description, setting.engine_profile_name)
    if (imageData.length > 0) {
        let imageUrl = imageData[0]
        console.log('生成图片url: ', imageUrl)
        return res.status(200).json({ 'msg': '发布成功', 'url': imageUrl });
    } else {
        await db.psy_trail.update({
            where: { nano_id: promptNanoId },
            data: { state: 'FAILED' }
        })
        const body = JSON.stringify({ 'msg': '发布失败' })
        const res = new Response(body, {
            status: 401,
            statusText: 'Unauthorized',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return res
    }
}