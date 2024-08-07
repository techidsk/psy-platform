import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * /api/trail/update
 * 更新用户实验记录
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

    const state = data['state'] || 'SUCCESS';

    await db.trail.update({
        where: {
            nano_id: promptNanoId,
        },
        data: {
            state: state,
            image_url: imageUrl,
            update_time: new Date(),
            generate_prompt: data.prompt,
        },
    });
    return NextResponse.json({ msg: '发布成功', url: imageUrl });
}
