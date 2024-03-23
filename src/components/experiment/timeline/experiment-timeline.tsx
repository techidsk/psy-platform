import { redirect } from 'next/navigation';
import { logger } from '@/lib/logger';
import { db } from '@/lib/db';
import ExperimentStepTimeline from './experiment-step-timeline';

// 获取用户在当前项目中的分组实验内容
// 1. 如果用户从未登陆，则查看是否当前项目，否则显示当前时间尚未开放实验
// 2. 如果有当前项目，但是没有分组，则查看是否有项目分组，如果没有则显示当前时间无可用分组
// 3. 如果有项目分组，随机选择分组，并则查看是否有对应实验，如果没有则显示当前时间无可用实验
// 4. 如果有对应实验，则返回实验内容

async function getExperiment(experimentId: number) {
    const experiment = await db.experiment.findFirst({
        where: {
            id: experimentId,
        },
    });
    if (!experiment) {
        throw new Error('实验不存在');
    }
    return experiment;
}

async function getExperimentSteps(experimentId: number) {
    const result = await db.experiment_steps.findMany({
        where: {
            experiment_id: experimentId,
        },
        orderBy: [{ pre: 'desc' }, { order: 'asc' }],
    });
    return result;
}

async function getUserPrivacy(userId: number) {
    const user = await db.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            gender: true,
            ages: true,
        },
    });
    return user;
}

interface ExperimentTimelineProps {
    nextExperimentId: number; // 实验ID
    userId: number;
    guest?: boolean;
    guestUserNanoId?: string;
}

// 获取实验步骤
export default async function ExperimentTimeline({
    nextExperimentId,
    userId,
    guestUserNanoId,
    guest = false,
}: ExperimentTimelineProps) {
    // 绑定用户的性别和年龄和Qualtrics
    const user = await getUserPrivacy(userId);
    if (!user) {
        redirect('/login');
    }
    let showUserPrivacy = false;
    if (user.gender == null || user.ages == null) {
        // 需要用户录入性别数据
        showUserPrivacy = true;
    }

    const experimentData = getExperiment(nextExperimentId);
    const experimentStepData = getExperimentSteps(nextExperimentId);
    const [experiment, experimentSteps] = await Promise.all([experimentData, experimentStepData]);

    if (experimentSteps.length === 0) {
        logger.warn(`[实验${nextExperimentId}] 没有添加实验步骤`);
    }

    return (
        <>
            <div className="p-2">
                <ExperimentStepTimeline
                    experiment={experiment}
                    experimentSteps={experimentSteps}
                    showUserPrivacy={showUserPrivacy}
                    userId={userId}
                    guestUserNanoId={guestUserNanoId}
                    guest={guest}
                />
            </div>
        </>
    );
}
