import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { generate } from '@/lib/generate';
import { uploadImage } from '@/lib/upload';
require('dotenv').config()

/**
 * /api/generate
 * 用户测试引擎效果
 * @returns 
 */
export async function POST(request: Request) {
    console.log('----------- generate ------------');

    const data = await request.json()

    let promptNanoId = data['promptNanoId']
    // 生成图片并上传oss
    let imageData = await generate(data['prompt'])
    if (imageData.data.length > 0) {
        let imageUrl = imageData.data[0].url
        console.log('生成图片url: ', imageUrl)
        // project/_psy_/avatar-2.jpg?x-oss-process=style/wb

        // 上传OSS
        // let target = `project/_psy_/image/${data['nano_id']}/${promptNanoId}.png`
        // let img = process.env.OSS_URL + target + '?x-oss-process=style/wb'
        // await uploadImage(imageUrl, target)'
        await db.psy_trail.update({
            where: {
                nano_id: promptNanoId
            },
            data: {
                state: 'SUCCESS',
                image_url: imageUrl
            }
        })
        return NextResponse.json({ 'msg': '发布成功', 'url': imageUrl });
    } else {
        await db.psy_trail.update({
            where: {
                nano_id: promptNanoId
            },
            data: {
                state: 'FAILED'
            }
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
