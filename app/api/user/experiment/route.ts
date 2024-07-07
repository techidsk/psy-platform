import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
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
    const prevUserExperimentNanoId = data['prevUserExperimentNanoId'] || '';
    const part: number = (data['part'] as any as number) || 0;

    const {
        status: status,
        message: message,
        project_group_id: projectGroupId,
        experiment_id: experimentId,
        user_id: userId,
    } = await getUserGroupExperiments(guest, guestUserNanoId);

    if (status !== 200) {
        return NextResponse.json({ msg: message });
    }

    if (!projectGroupId) {
        return NextResponse.json({ msg: '项目分组不存在' });
    }

    if (!userId) {
        return NextResponse.json({ msg: '未找到合法的用户ID' });
    }

    // 获取实验属性
    const experiment = await db.experiment.findFirst({
        where: {
            nano_id: data['experimentId'],
        },
    });

    // TODO engineid异常
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
            return NextResponse.json({
                msg: '没有有效的生成引擎',
            });
        }

        let engineId = randomEngineIds[0].engine_id;

        const userExperimentNanoId =
            prevUserExperimentNanoId === '' ? getId() : prevUserExperimentNanoId;

        const dbUserExperiment = await db.user_experiments.findFirst({
            where: {
                nano_id: userExperimentNanoId,
                part: part,
            },
        });
        if (dbUserExperiment) {
            return NextResponse.json({
                msg: '实验已存在',
                data: {
                    userExperimentNanoId: userExperimentNanoId,
                },
            });
        }

        await db.user_experiments.create({
            data: {
                nano_id: userExperimentNanoId,
                type: 'EXPERIMENT',
                engine_id: engineId,
                user_id: userId,
                experiment_id: `${experimentId}`,
                project_group_id: projectGroupId,
                part: part,
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
