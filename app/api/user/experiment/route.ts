import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getCurrentUser, getUserGroupExperiments } from '@/lib/session';
import { getId } from '@/lib/nano-id';

/**
 * /api/user/experiment
 * 创建用户新实验
 * @returns
 */
export async function POST(request: Request) {
    const data = await request.json();
    console.log(data);
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
        const experimentNanoId = getId();
        let item: any = {
            nano_id: experimentNanoId,
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
                experimentNanoId: experimentNanoId,
            },
        });
    }

    // // 插入用户实验表
    // let dbExperiment = await db.user_experiments.findFirst({
    //     where: {
    //         nano_id: experimentNanoId,
    //     },
    // });

    // if (!dbExperiment) {
    //     // 判断当前用户的所属业务分组
    //     const { project_group_id: projectGroupId, experiment_id: experimentId } =
    //         await getUserGroupExperiments();

    //     console.log(
    //         '未找到用户实验记录，创建新实验：projectGroupId: ',
    //         projectGroupId,
    //         'experimentId: ',
    //         experimentId
    //     );

    //     const experiment = await db.experiment.findFirst({
    //         where: { id: experimentId },
    //     });

    //     let item: any = {
    //         nano_id: getId(),
    //         type: data['trail'] ? 'TRAIL' : 'EXPERIMENT',
    //         engine_id: experiment?.engine_id,
    //         user_id: parseInt(data['user_id']),
    //     };

    //     console.log('创建用户实验: ', item);
    //     dbExperiment = await db.user_experiments.create({
    //         data: {
    //             ...item,
    //             experiment_id: `${experimentId}`,
    //             project_group_id: projectGroupId,
    //         },
    //     });

    //     if (!data['trail']) {
    //         await db.user_group.update({
    //             where: {
    //                 user_id_project_group_id: {
    //                     user_id: parseInt(data['user_id']),
    //                     project_group_id: projectGroupId,
    //                 },
    //             },
    //             data: {
    //                 project_experiment_times: {
    //                     increment: 1,
    //                 },
    //             },
    //         });
    //     }
    // }

    // let trailNanoId = data['promptNanoId'];
    // // 插入用户submit记录用以生成图片
    // await db.trail.create({
    //     data: {
    //         user_experiment_id: experimentNanoId,
    //         user_id: parseInt(data['user_id']),
    //         prompt: data['prompt'],
    //         state: 'GENERATING',
    //         nano_id: trailNanoId,
    //     },
    // });

    return NextResponse.json({ msg: '发布成功' });
}
