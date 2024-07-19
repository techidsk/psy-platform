import { redirect } from 'next/navigation';
import { logger } from '@/lib/logger';
import { db } from '@/lib/db';
import ExperimentStepTimeline from './experiment-step-timeline';
import { toast } from '@/hooks/use-toast';

// 获取用户在当前项目中的分组实验内容
// 1. 如果用户从未登陆，则查看是否当前项目，否则显示当前时间尚未开放实验
// 2. 如果有当前项目，但是没有分组，则查看是否有项目分组，如果没有则显示当前时间无可用分组
// 3. 如果有项目分组，随机选择分组，并则查看是否有对应实验，如果没有则显示当前时间无可用实验
// 4. 如果有对应实验，则返回实验内容

// 获取实验内容
async function getExperiment(experimentId: number) {
    const experiment = await db.experiment.findFirst({
        where: {
            id: experimentId,
        },
    });
    if (!experiment) {
        logger.warn(`实验${experimentId}不存在`);
        // throw new Error('实验不存在');
        redirect('/closed/30003');
    }
    return experiment;
}

async function getExperimentSteps(experimentId: number) {
    const result = await db.experiment_steps.findMany({
        where: {
            experiment_id: experimentId,
        },
        orderBy: [{ order: 'asc' }],
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
            nano_id: true,
        },
    });
    return user;
}

async function getUserNanoId(userId: number) {
    const user = await db.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            nano_id: true,
        },
    });
    return user?.nano_id;
}

interface ExperimentTimelineProps {
    nextExperimentId: number; // 用户需要进行的下一组实验ID
    userId: number;
    guest?: boolean;
    guestUserNanoId?: string;
    stepIndex?: number; // 当前实验的步骤
    userExperimentNanoId: string; // 本次实验中的 实验nano_id
}

// 获取实验步骤
// 一整个实验流程
export default async function ExperimentTimeline({
    nextExperimentId,
    userId,
    guestUserNanoId,
    stepIndex = 1,
    guest = false,
    userExperimentNanoId,
}: ExperimentTimelineProps) {
    logger.info(
        `用户 <${userId}> 的下一组实验 [实验${nextExperimentId}] 进入实验流程[${stepIndex}]步`
    );

    // 绑定用户的性别和年龄和Qualtrics
    const user = await getUserPrivacy(userId);
    if (!user) {
        redirect('/login');
    }

    if (!user.nano_id) {
        redirect('/login');
    }

    // 获取实验
    const experimentData = getExperiment(nextExperimentId);
    // 获取实验步骤
    const experimentStepData = getExperimentSteps(nextExperimentId);
    const [experiment, experimentSteps] = await Promise.all([experimentData, experimentStepData]);

    if (experimentSteps.length === 0) {
        logger.warn(`[实验${nextExperimentId}] 没有添加实验步骤`);
        toast({
            title: '无法实验',
            description: '当前实验没有添加实验步骤，请联系管理员',
            variant: 'destructive',
            duration: 5000,
        });
    }

    const userNanoId = await getUserNanoId(userId);
    if (!userNanoId) {
        logger.error(`[实验${nextExperimentId}] 用户${userId}没有绑定nano_id`);
        toast({
            title: '无法实验',
            description: '您没有绑定nano_id，请联系管理员',
            variant: 'destructive',
            duration: 5000,
        });
        redirect('/guest');
    }

    return (
        <div className="p-2">
            <ExperimentStepTimeline
                experiment={experiment}
                experimentSteps={experimentSteps}
                userId={userId}
                guestUserNanoId={guestUserNanoId}
                guest={guest}
                userNanoId={userNanoId}
                targetStepIndex={stepIndex}
                userExperimentNanoId={userExperimentNanoId}
                uniqueKey={user.nano_id}
            />
        </div>
    );
}
