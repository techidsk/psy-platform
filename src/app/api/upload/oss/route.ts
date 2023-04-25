import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { generate } from '@/lib/generate';
import { uploadImage } from '@/lib/upload';
require('dotenv').config()

/**
 * /api/upload/oss
 * 用户测试引擎效果
 * @returns 
 */
export async function POST(request: Request) {
    console.log('----------- generate ------------');

    const data = await request.json()

    let promptNanoId = data['promptNanoId']
    let imageUrl = data['imageUrl']
    let target = `project/_psy_/image/${data['nano_id']}/${promptNanoId}.png`
    let img = process.env.OSS_URL + target + '?x-oss-process=style/wb'
    await uploadImage(imageUrl, target)
    await db.psy_trail.update({
        where: {
            nano_id: promptNanoId
        },
        data: {
            state: 'SUCCESS',
            image_url: img
        }
    })
    return NextResponse.json({ 'msg': '发布成功', 'url': img });
}
