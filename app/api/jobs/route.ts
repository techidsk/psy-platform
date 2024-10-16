import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * 更新实验状态
 * /api/jobs
 * @returns
 */
export async function GET(request: Request) {
    try {
        // 使用原始 SQL 查询获取需要更新的实验 ID
        const rawQuery = `
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
                    AND s.'order' = ue.part
                WHERE ue.state = 'IN_EXPERIMENT'
                ORDER BY ue.id DESC
            ) a
            WHERE countdown_result < minutes_since_start
        `;

        const userExperiments = await db.$queryRaw<any[]>`${rawQuery}`;

        // 更新状态
        if (userExperiments.length > 0) {
            logger.info(`更新实验状态 ${userExperiments.length} 条`);
            await db.user_experiments.updateMany({
                where: {
                    id: {
                        in: userExperiments.map((item: { id: number }) => item.id),
                    },
                },
                data: {
                    finish_time: new Date(),
                    state: 'FINISHED',
                },
            });
        }

        return NextResponse.json({ message: '更新成功' }, { status: 200 });
    } catch (error) {
        console.error('更新实验状态失败:', error);
        return NextResponse.json({ error: '更新实验状态失败' }, { status: 500 });
    }
}
