import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { getId } from '@/lib/nano-id';
import { getUserGroupExperiments } from '@/lib/user_experiment';
import { logger } from '@/lib/logger';

/**
 * /api/user/experiment
 * 创建用户新实验
 * @returns 返回 userExperimentNanoId
 */
export async function POST(request: Request) {
    const data = await request.json();
    const guest = data['guest'] || false;
    const guestUserNanoId = data['guestUserNanoId'] || '';
    const {
        project_group_id: projectGroupId,
        experiment_id: experimentId,
        user_id: userId,
    } = await getUserGroupExperiments(guest, guestUserNanoId);

    if (!projectGroupId) {
        return NextResponse.json({ msg: '项目分组不存在' });
    }

    if (!userId) {
        return NextResponse.json({ msg: '未找到合法的userId @ /api/user/experiment/route.ts' });
    }

    // 获取实验属性
    const experiment = await db.experiment.findFirst({
        where: {
            nano_id: data['experimentId'],
        },
    });

    // TOOD engineid异常

    if (experiment) {
        // 创建用户实验 user_experiments
        // 平均分配
        let randomEngineIds = await db.$queryRaw<any[]>`
            WITH Experiment AS (
                SELECT jt.engine_id
                FROM experiment,
                JSON_TABLE(
                    engine_ids,
                    '$[*]' COLUMNS(engine_id INT PATH '$')
                ) AS jt
                WHERE id = ${experiment.id}
            ),
            Counts AS (
                SELECT engine_id, COUNT(*) AS num
                FROM user_experiments
                WHERE engine_id IN (SELECT engine_id FROM Experiment)
                GROUP BY engine_id
            ),
            AllEngines AS (
                SELECT engine_id
                FROM Experiment
            ),
            Combined AS (
                SELECT AllEngines.engine_id, IFNULL(Counts.num, 0) AS num
                FROM AllEngines
                LEFT JOIN Counts ON AllEngines.engine_id = Counts.engine_id
            ),
            MinNum AS (
                SELECT MIN(num) AS min_num
                FROM Combined
            )

            -- 选择engine_id基于num的最小值和相差值
            SELECT engine_id
            FROM Combined, MinNum
            WHERE num <= min_num + 2
            ORDER BY CASE WHEN num > min_num + 2 THEN num ELSE RAND() END
            LIMIT 1;
        `;
        if (randomEngineIds.length === 0) {
            logger.error('没有可用的engineId');
            return;
        }

        let engineId = randomEngineIds[0].engine_id;

        const userExperimentNanoId = getId();
        await db.user_experiments.create({
            data: {
                nano_id: userExperimentNanoId,
                type: 'EXPERIMENT',
                engine_id: engineId,
                user_id: userId,
                experiment_id: `${experimentId}`,
                project_group_id: projectGroupId,
            },
        });
        // 更新用户实验次数

        return NextResponse.json({
            msg: '发布成功',
            data: {
                userExperimentNanoId: userExperimentNanoId,
            },
        });
    }

    return NextResponse.json({ msg: '发布成功' });
}
