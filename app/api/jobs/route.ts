import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getGenerateResult } from '@/lib/generate';

// 长时间 GENERATING 状态的超时时间（5分钟）
const GENERATING_TIMEOUT_MINUTES = 5;

/**
 * 更新实验状态
 * /api/jobs
 * @returns
 */
export async function GET(request: Request) {
    try {
        // 使用原始 SQL 查询获取需要更新的实验 ID
        const userExperiments = await db.$queryRaw<any[]>`
        SELECT id
            FROM (
                SELECT ue.id,
                    CASE
                        WHEN COALESCE(JSON_EXTRACT(s.content, '$.countdown'), 60) = 0 THEN 60
                        ELSE COALESCE(JSON_EXTRACT(s.content, '$.countdown'), 60)
                    END AS countdown_result,
                    TIMESTAMPDIFF(MINUTE, CONVERT_TZ(ue.start_time, '+00:00', '+08:00'), CONVERT_TZ(NOW(), '+00:00', '+00:00')) AS minutes_since_start
                FROM user_experiments ue
                LEFT JOIN experiment_steps s
                    ON s.experiment_id = ue.experiment_id
                    AND s.\`order\` = ue.part
                WHERE ue.state = 'IN_EXPERIMENT'
                ORDER BY ue.id DESC
            ) a
            WHERE countdown_result < minutes_since_start
        `;

        // 更新超时的实验状态为FAILED
        if (userExperiments.length > 0) {
            logger.info(`更新超时实验状态 ${userExperiments.length} 条`);
            await db.user_experiments.updateMany({
                where: {
                    id: {
                        in: userExperiments.map((item: { id: number }) => item.id),
                    },
                },
                data: {
                    finish_time: new Date(),
                    state: 'FAILED',
                },
            });
        }

        // 检查生成失败的实验
        const failedExperiments = await db.$queryRaw<any[]>`
        SELECT DISTINCT ue.id
        FROM user_experiments ue
        JOIN trail t ON t.user_experiment_id = ue.nano_id
        WHERE ue.state = 'IN_EXPERIMENT'
        AND (t.state = 'FAILED' OR t.state = 'TIMEOUT')
        `;

        // 更新生成失败的实验状态
        if (failedExperiments.length > 0) {
            logger.info(`更新生成失败实验状态 ${failedExperiments.length} 条`);
            await db.user_experiments.updateMany({
                where: {
                    id: {
                        in: failedExperiments.map((item: { id: number }) => item.id),
                    },
                },
                data: {
                    finish_time: new Date(),
                    state: 'FAILED',
                },
            });
        }

        // 补偿机制：检查长时间处于 GENERATING 状态的 trail
        await checkStaleGeneratingTrails();

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        logger.error('更新实验状态失败:', error);
        return NextResponse.json({ status: 'error', message: error }, { status: 500 });
    }
}

/**
 * 检查并处理长时间处于 GENERATING 状态的 trail
 * 对于超过指定时间仍为 GENERATING 的任务，重新查询外部服务状态并更新
 */
async function checkStaleGeneratingTrails() {
    try {
        // 查找超过 5 分钟仍为 GENERATING 状态的 trail
        const staleTrails = await db.trail.findMany({
            where: {
                state: 'GENERATING',
                create_time: {
                    lt: new Date(Date.now() - GENERATING_TIMEOUT_MINUTES * 60 * 1000),
                },
                request_id: {
                    not: null,
                },
            },
            select: {
                id: true,
                nano_id: true,
                request_id: true,
                create_time: true,
            },
            take: 20, // 每次最多处理 20 个，避免阻塞过长
        });

        if (staleTrails.length === 0) {
            return;
        }

        logger.info(`发现 ${staleTrails.length} 个长时间 GENERATING 的 trail，开始补偿检查`);

        for (const trail of staleTrails) {
            if (!trail.request_id) {
                // 没有 request_id，直接标记为失败
                await db.trail.update({
                    where: { id: trail.id },
                    data: { state: 'FAILED', update_time: new Date() },
                });
                logger.warn(`trail ${trail.nano_id} 无 request_id，标记为 FAILED`);
                continue;
            }

            try {
                // 查询外部服务状态
                const result = await getGenerateResult(trail.request_id);

                if (result.status === 'completed' && result.result) {
                    // 任务已完成，更新状态
                    await db.trail.update({
                        where: { id: trail.id },
                        data: {
                            state: 'SUCCESS',
                            image_url: result.result.image_url,
                            generate_prompt: result.result.chat_result,
                            update_time: new Date(),
                        },
                    });
                    logger.info(`trail ${trail.nano_id} 补偿成功，任务已完成`);
                } else if (result.status === 'failed') {
                    // 任务失败
                    await db.trail.update({
                        where: { id: trail.id },
                        data: { state: 'FAILED', update_time: new Date() },
                    });
                    logger.warn(`trail ${trail.nano_id} 外部服务返回失败: ${result.message}`);
                } else if (result.status === 'pending') {
                    // 仍在处理中，检查是否超时过久（超过 10 分钟直接标记失败）
                    const ageMinutes =
                        (Date.now() - new Date(trail.create_time).getTime()) / 1000 / 60;
                    if (ageMinutes > 10) {
                        await db.trail.update({
                            where: { id: trail.id },
                            data: { state: 'TIMEOUT', update_time: new Date() },
                        });
                        logger.warn(`trail ${trail.nano_id} 超过 10 分钟仍在处理，标记为 TIMEOUT`);
                    }
                }
            } catch (error) {
                logger.error(`补偿检查 trail ${trail.nano_id} 时出错: ${error}`);
                // 查询失败不立即标记为失败，等待下次检查
            }
        }
    } catch (error) {
        logger.error(`检查长时间 GENERATING trail 失败: ${error}`);
    }
}
