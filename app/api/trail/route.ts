import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getParticipantId } from '@/lib/experiment-participant';
import { logger } from '@/lib/logger';

/**
 * /api/trail
 * 用户测试引擎效果
 * @returns
 */
export async function POST(request: Request) {
    try {
        const data = await request.json();
        const userId = await getParticipantId(Boolean(data.guest), data.guestNanoId);
        if (!userId) return NextResponse.json({ msg: '参与者身份无效' }, { status: 401 });

        const experimentNanoId = data['nano_id']; // 本次实验ID
        const trailNanoId = data['promptNanoId'];
        const prompt = data['prompt'];

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

        const partValue = parseInt(data['part']);
        if (isNaN(partValue)) {
            logger.error(`创建trail失败: part无效 - ${data['part']}`);
            return NextResponse.json(
                { msg: '创建失败，步骤参数无效', error: 'INVALID_PART' },
                { status: 400 }
            );
        }

        return await db.$transaction(async (tx) => {
            // 锁住参与者的实验行，让同一实验的并发提交依次检查可用名额。
            const parts = await tx.$queryRaw<{ part: number }[]>`
                SELECT part FROM user_experiments
                WHERE nano_id = ${experimentNanoId} AND user_id = ${userId} FOR UPDATE
            `;
            if (!parts.some((row) => row.part === partValue)) {
                return NextResponse.json({ msg: '未找到实验步骤' }, { status: 404 });
            }
            const scope = { user_experiment_id: experimentNanoId, user_id: userId };
            const pending = await tx.trail.count({ where: { ...scope, state: 'GENERATING' } });
            if (pending >= 2) {
                return NextResponse.json({ msg: '最多同时处理两个生成任务' }, { status: 429 });
            }
            await tx.trail.create({
                data: {
                    ...scope,
                    prompt,
                    state: 'GENERATING',
                    nano_id: trailNanoId,
                    part: partValue,
                },
            });
            return NextResponse.json({ msg: '发布成功' });
        });
    } catch (error) {
        logger.error(`创建trail异常: ${error}`);
        return NextResponse.json(
            { msg: '创建失败，服务器内部错误', error: 'INTERNAL_ERROR' },
            { status: 500 }
        );
    }
}
