import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

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

        // 检查生成失败的实验：只在所有 trail 都失败时才标记实验 FAILED
        const failedExperiments = await db.$queryRaw<any[]>`
        SELECT DISTINCT ue.id
        FROM user_experiments ue
        JOIN trail t ON t.user_experiment_id = ue.nano_id
        WHERE ue.state = 'IN_EXPERIMENT'
        AND (t.state = 'FAILED' OR t.state = 'TIMEOUT')
        AND NOT EXISTS (
            SELECT 1 FROM trail t2
            WHERE t2.user_experiment_id = ue.nano_id
            AND t2.state NOT IN ('FAILED', 'TIMEOUT')
        )
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
 * 由于图片生成已改为同步调用，超时的 GENERATING trail 直接标记为 FAILED
 */
async function checkStaleGeneratingTrails() {
    try {
        const result = await db.trail.updateMany({
            where: {
                state: 'GENERATING',
                create_time: {
                    lt: new Date(Date.now() - GENERATING_TIMEOUT_MINUTES * 60 * 1000),
                },
            },
            data: { state: 'FAILED', update_time: new Date() },
        });

        if (result.count > 0) {
            logger.info(`已将 ${result.count} 个超时 GENERATING trail 标记为 FAILED`);
        }
    } catch (error) {
        logger.error(`检查长时间 GENERATING trail 失败: ${error}`);
    }
}
