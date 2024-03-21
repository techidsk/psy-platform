import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { getId } from '@/lib/nano-id';
import { getUserGroupExperiments } from '@/lib/user_experiment';

/**
 * /api/user/experiment
 * 创建用户新实验
 * @returns 返回 userExperimentNanoId
 */
export async function POST(request: Request) {
    const data = await request.json();

    const currentUser = await getCurrentUser();
    data['user_id'] = currentUser?.id;

    const experiment = await db.experiment.findFirst({
        where: {
            nano_id: data['experimentId'],
        },
    });

    const { project_group_id: projectGroupId, experiment_id: experimentId } =
        await getUserGroupExperiments();

    if (experiment) {
        const userExperimentNanoId = getId();
        let item: any = {
            nano_id: userExperimentNanoId,
            type: 'EXPERIMENT',
            engine_id: experiment?.engine_id,
            user_id: parseInt(data['user_id']),
        };

        console.log('创建用户实验: ', item);
        let dbExperiment = await db.user_experiments.create({
            data: {
                ...item,
                experiment_id: `${experimentId}`,
                project_group_id: projectGroupId,
            },
        });
        // 更新用户实验次数
        await db.user_group.update({
            where: {
                user_id_project_group_id: {
                    user_id: parseInt(data['user_id']),
                    project_group_id: projectGroupId,
                },
            },
            data: {
                project_experiment_times: {
                    increment: 1,
                },
            },
        });
        return NextResponse.json({
            msg: '发布成功',
            data: {
                userExperimentNanoId: userExperimentNanoId,
            },
        });
    }

    return NextResponse.json({ msg: '发布成功' });
}
