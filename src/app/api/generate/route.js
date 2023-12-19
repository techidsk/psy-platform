import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { generate } from '@/lib/generate';
import { nanoid } from 'nanoid'
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
 * /api/generate
 * @returns 
 */
export async function POST(request) {
    const json = await request.json()
    const promptNanoId = json?.id;
    const engineId = json?.engineId;
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
    let setting = await db.psy_engine.findFirst({
        where: { id: BigInt(engineId) }
    })

    const prompt = await translate(setting.engine_description, data['prompt'])
    console.log(prompt)
    let response = await generate(prompt)
    let imageData = response.data?.images
    if (imageData.length > 0) {
        let imageUrl = imageData[0]
        console.log('生成图片url: ', imageUrl)
        return NextResponse.json({ 'msg': '发布成功', 'url': imageUrl })
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
