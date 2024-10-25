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
        // 添加新的 SQL 语句来重新排序 experiment_steps
        logger.info('重新排序实验步骤');
        // await db.$executeRaw`
        // SET @current_experiment_id = NULL;
        // SET @new_order = 0;

        // UPDATE experiment_steps
        // SET \`order\` = (
        //     CASE
        //         WHEN @current_experiment_id = experiment_id THEN @new_order := @new_order + 1
        //         ELSE @new_order := 1 AND @current_experiment_id := experiment_id
        //     END
        // )
        // ORDER BY experiment_id, \`order\`;
        // `;

        // // 使用原始 SQL 查询获取需要更新的实验 ID
        // const userExperiments = await db.$queryRaw<any[]>`
        // SELECT id
        //     FROM (
        //         SELECT ue.id,
        //             CASE
        //                 WHEN COALESCE(JSON_EXTRACT(s.content, '$.countdown'), 60) = 0 THEN 60
        //                 ELSE COALESCE(JSON_EXTRACT(s.content, '$.countdown'), 60)
        //             END AS countdown_result,
        //             TIMESTAMPDIFF(MINUTE, CONVERT_TZ(ue.start_time, '+00:00', '+08:00'), CONVERT_TZ(NOW(), '+00:00', '+00:00')) AS minutes_since_start
        //         FROM user_experiments ue
        //         LEFT JOIN experiment_steps s
        //             ON s.experiment_id = ue.experiment_id
        //             AND s.\`order\` = ue.part
        //         WHERE ue.state = 'IN_EXPERIMENT'
        //         ORDER BY ue.id DESC
        //     ) a
        //     WHERE countdown_result < minutes_since_start
        // `;

        // // 更新状态
        // if (userExperiments.length > 0) {
        //     logger.info(`更新实验状态 ${userExperiments.length} 条`);
        //     await db.user_experiments.updateMany({
        //         where: {
        //             id: {
        //                 in: userExperiments.map((item: { id: number }) => item.id),
        //             },
        //         },
        //         data: {
        //             finish_time: new Date(),
        //             state: 'FINISHED',
        //         },
        //     });
        // }

        return NextResponse.json({ message: '更新成功' }, { status: 200 });
    } catch (error) {
        console.error('更新实验状态失败:', error);
        return NextResponse.json({ error: '更新实验状态失败' }, { status: 500 });
    }
}
