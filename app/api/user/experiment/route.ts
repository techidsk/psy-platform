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

    if (experiment) {
        // 创建用户实验 user_experiments
        const userExperimentNanoId = getId();
        await db.user_experiments.create({
            data: {
                nano_id: userExperimentNanoId,
                type: 'EXPERIMENT',
                engine_id: experiment?.engine_id,
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
