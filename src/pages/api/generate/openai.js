import { db } from '@/lib/db';
import { generate } from '@/lib/generate';
require('dotenv').config()

/**
 * /api/generate/openai
 * 用户测试引擎效果
 * @returns 
 */
export default async function handler(
    req,
    res
) {
    console.log('----------- generate ------------');
    const promptNanoId = req?.query?.id;
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
    let imageData = await generate(data['prompt'])
    if (imageData.data.length > 0) {
        let imageUrl = imageData.data[0].url
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
