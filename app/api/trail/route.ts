import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getCurrentUser, getUserGroupExperiments } from '@/lib/session';

/**
 * /api/trail
 * 用户测试引擎效果
 * @returns
 */
export async function POST(request: Request) {
    const data = await request.json();
    const currentUser = await getCurrentUser();
    data['user_id'] = currentUser?.id;
    const experimentId = data['nano_id']; // 本次实验ID
    // 插入用户实验表
    const dbExperiment = await db.user_experiments.findFirst({
        where: {
            nano_id: experimentId,
        },
    });

    let item: any = {
        nano_id: experimentId,
        type: data['trail'] ? 'TRAIL' : 'EXPERIMENT',
        engine_id: parseInt(data['engine_id']),
        user_id: parseInt(data['user_id']),
    };

    // const experimentNanoId = data['experimentId'] || undefined; // 关联实验ID
    // if (experimentNanoId) {
    //     item = {
    //         ...item,
    //         experiment_id: experimentNanoId,
    //     };
    // }
    console.log('trail data: ', item);
    if (!dbExperiment) {
        // 判断当前用户的所属业务分组
        const { project_group_id: projectGroupId, experiment_id: experimentId } =
            await getUserGroupExperiments();
        await db.user_experiments.create({
            data: {
                ...item,
                experiment_id: `${experimentId}`,
                project_group_id: projectGroupId,
            },
        });

        if (!data['trail']) {
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
        }
    }

    let trailNanoId = data['promptNanoId'];
    // 插入用户submit记录用以生成图片
    await db.trail.create({
        data: {
            user_experiment_id: experimentId,
            user_id: parseInt(data['user_id']),
            prompt: data['prompt'],
            engine_id: parseInt(data['engine_id']),
            state: 'GENERATING',
            nano_id: trailNanoId,
        },
    });

    return NextResponse.json({ msg: '发布成功' });
}
