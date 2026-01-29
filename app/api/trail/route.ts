import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { logger } from '@/lib/logger';

/**
 * /api/trail
 * 用户测试引擎效果
 * @returns
 */
export async function POST(request: Request) {
    try {
        const data = await request.json();
        const currentUser = await getCurrentUser();
        const guest = data['guest'] || false;

        if (!guest) {
            data['user_id'] = currentUser?.id;
        } else {
            const guestNanoId = data['guestNanoId'];
            if (!guestNanoId) {
                logger.error('创建trail失败: guestNanoId为空');
                return NextResponse.json(
                    { msg: '创建失败，缺少游客ID', error: 'MISSING_GUEST_ID' },
                    { status: 400 }
                );
            }
            const guestUser = await db.user.findFirst({
                where: { nano_id: guestNanoId },
            });
            if (!guestUser) {
                logger.error(`创建trail失败: 找不到游客用户 ${guestNanoId}`);
                return NextResponse.json(
                    { msg: '创建失败，找不到用户', error: 'USER_NOT_FOUND' },
                    { status: 404 }
                );
            }
            data['user_id'] = guestUser.id;
        }

        const experimentNanoId = data['nano_id']; // 本次实验ID
        const trailNanoId = data['promptNanoId'];
        const prompt = data['prompt'];
        const userId = data['user_id'];

        // 验证必要参数
        if (!experimentNanoId) {
            logger.error('创建trail失败: nano_id为空');
            return NextResponse.json(
                { msg: '创建失败，缺少实验ID', error: 'MISSING_EXPERIMENT_ID' },
                { status: 400 }
            );
        }

        if (!trailNanoId) {
            logger.error('创建trail失败: promptNanoId为空');
            return NextResponse.json(
                { msg: '创建失败，缺少提交ID', error: 'MISSING_TRAIL_ID' },
                { status: 400 }
            );
        }

        if (!prompt) {
            logger.error('创建trail失败: prompt为空');
            return NextResponse.json(
                { msg: '创建失败，缺少提示内容', error: 'MISSING_PROMPT' },
                { status: 400 }
            );
        }

        if (!userId || isNaN(Number(userId))) {
            logger.error(`创建trail失败: userId无效 - ${userId}`);
            return NextResponse.json(
                { msg: '创建失败，用户ID无效', error: 'INVALID_USER_ID' },
                { status: 400 }
            );
        }

        const partValue = parseInt(data['part']);
        if (isNaN(partValue)) {
            logger.error(`创建trail失败: part无效 - ${data['part']}`);
            return NextResponse.json(
                { msg: '创建失败，步骤参数无效', error: 'INVALID_PART' },
                { status: 400 }
            );
        }

        // 插入用户submit记录用以生成图片
        await db.trail.create({
            data: {
                user_experiment_id: experimentNanoId,
                user_id: Number(userId),
                prompt: prompt,
                state: 'GENERATING',
                nano_id: trailNanoId,
                part: partValue,
            },
        });

        return NextResponse.json({ msg: '发布成功' });
    } catch (error) {
        logger.error(`创建trail异常: ${error}`);
        return NextResponse.json(
            { msg: '创建失败，服务器内部错误', error: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}
