import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
require('dotenv').config();

/**
 * /api/upload/oss
 * 用户测试引擎效果
 * @returns
 */
export async function POST(request: Request) {
    const data = await request.json();

    let promptNanoId = data['promptNanoId'];
    if (!promptNanoId) {
        const body = JSON.stringify({ msg: 'promptNanoId为空' });
        const res = new Response(body, {
            status: 401,
            statusText: 'Unauthorized',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return res;
    }
    let imageUrl = data['imageUrl'];
    if (!imageUrl) {
        const body = JSON.stringify({ msg: 'imageUrl为空' });
        const res = new Response(body, {
            status: 401,
            statusText: 'Unauthorized',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return res;
    }
    await db.trail.update({
        where: {
            nano_id: promptNanoId,
        },
        data: {
            state: 'SUCCESS',
            image_url: imageUrl,
            update_time: new Date(),
            generate_prompt: data.prompt,
        },
    });
    return NextResponse.json({ msg: '发布成功', url: imageUrl });
}
