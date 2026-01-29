import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * /api/trail/update
 * 更新用户实验记录
 * @returns
 */
export async function POST(request: Request) {
    try {
        const data = await request.json();

        const promptNanoId = data['promptNanoId'];
        if (!promptNanoId) {
            logger.error('更新trail失败: promptNanoId为空');
            return NextResponse.json(
                { msg: '更新失败，缺少提交ID', error: 'MISSING_PROMPT_ID' },
                { status: 400 }
            );
        }

        const imageUrl = data['imageUrl'];
        const state = data['state'] || 'SUCCESS';

        // 验证 state 是有效值
        const validStates = ['GENERATING', 'SUCCESS', 'FAILED', 'TIMEOUT'];
        if (!validStates.includes(state)) {
            logger.error(`更新trail失败: 无效的状态值 - ${state}`);
            return NextResponse.json(
                { msg: '更新失败，无效的状态值', error: 'INVALID_STATE' },
                { status: 400 }
            );
        }

        // 检查 trail 是否存在
        const existingTrail = await db.trail.findUnique({
            where: { nano_id: promptNanoId },
        });

        if (!existingTrail) {
            logger.error(`更新trail失败: 找不到trail - ${promptNanoId}`);
            return NextResponse.json(
                { msg: '更新失败，找不到对应记录', error: 'TRAIL_NOT_FOUND' },
                { status: 404 }
            );
        }

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

        logger.info(`trail更新成功: ${promptNanoId} -> ${state}`);
        return NextResponse.json({ msg: '发布成功', url: imageUrl });
    } catch (error) {
        logger.error(`更新trail异常: ${error}`);
        return NextResponse.json(
            { msg: '更新失败，服务器内部错误', error: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}
