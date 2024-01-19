import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from './db';

export async function getSession() {
    return await getServerSession(authOptions);
}

export async function getCurrentUser() {
    const session = await getSession();
    return session?.user;
}

async function findProject() {
    // 1. 判断用户是否已经在已有的项目分组中
    const project = await db.projects.findFirst({
        where: {
            state: 'AVAILABLE',
            start_time: {
                lte: new Date(),
            },
            end_time: {
                gte: new Date(),
            },
        },
    });
    if (!project) {
        // 返回当前无可用项目
        throw new Error('当前时间无可用项目');
    }
    return project;
}

async function findProjectGroup(userId: number, project_id: number) {
    // 判断用户是否有对应的项目分组
    const userGroup = await db.user_group.findFirst({
        where: {
            user_id: userId,
            project_id: project_id,
        },
    });
    if (userGroup) {
        console.debug('user:', userId, 'has user group:', userGroup);
        // 获取对应得分组id以及进行过的试验次数
        const userProjectGroupId = userGroup.project_group_id;
        if (!userProjectGroupId) {
            throw new Error('用户未分配项目分组');
            // TODO 随机分配用户到对应的项目分组中
        }

        const projectGroup = await db.project_group.findFirst({
            where: {
                id: userProjectGroupId,
                state: 'AVAILABLE',
            },
        });
        if (!projectGroup) {
            throw new Error('所属分组不存在或者未激活');
        }
        console.debug('user:', userId, 'has project group:', projectGroup);

        const experimentList = await db.project_group_experiments.findMany({
            where: {
                project_group_id: userProjectGroupId,
            },
            select: {
                experiment_id: true,
                experiment_index: true,
            },
            orderBy: {
                experiment_index: 'asc',
            },
        });

        console.debug('user:', userId, 'experiments:', experimentList);

        // 获取对应的实验列表以及实验顺序
        const experimentTimes = userGroup.project_experiment_times || 0;
        if (!experimentList[experimentTimes]) {
            // TODO 提示用户已经完成所有实验
            return {
                status: 'FINISHED',
                message: '已经完成所有实验',
                experiment_id: undefined,
                project_group_id: userProjectGroupId,
            };
        }

        console.debug('user:', userId, 'need to do:', experimentList);
        // TODO 判断是否已经完成本周实验

        return {
            status: 'SUCCESS',
            experiment_id: experimentList[experimentTimes].experiment_id,
            project_group_id: userProjectGroupId,
        };
    } else {
        // 用户在当前项目并没有对应的项目，随机分配用户到对应的项目分组中
        const projectGroups = await db.project_group.findMany({
            where: {
                project_id: project_id,
                state: 'AVAILABLE',
            },
        });
        if (projectGroups?.length === 0) {
            // 返回当前无可用项目分组
            throw new Error('当前时间无可用项目分组');
        }

        // 随机选择一个分组
        const randomGroup = projectGroups[Math.floor(Math.random() * projectGroups.length)];
        const userProjectGroupId = randomGroup.id;
        const experimentList = await db.project_group_experiments.findMany({
            where: {
                project_group_id: userProjectGroupId,
            },
            select: {
                experiment_id: true,
                experiment_index: true,
            },
            orderBy: {
                experiment_index: 'asc',
            },
        });

        // 插入用户到项目分组中
        await db.user_group.create({
            data: {
                user_id: userId,
                project_id: project_id,
                project_group_id: userProjectGroupId,
                state: 1,
            },
        });
        if (!experimentList[0]) {
            throw new Error('暂未分配项目实验');
        }
        // 返回对应顺序的实验id
        return {
            experiment_id: experimentList[0].experiment_id,
            project_group_id: userProjectGroupId,
        };
    }
}

export async function getUserGroupExperiments() {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('用户未登陆');
    }
    const userId = parseInt(user?.id);
    // 1. 如果用户从未登陆，则查看是否当前项目，否则显示当前时间尚未开放实验
    const project = await findProject();
    console.log(`user: ${userId} project: ${project.id}`);
    const response = await findProjectGroup(userId, project.id);
    return response;
}

async function findLastExperiment(userId: string, projectGroupId: number) {
    const userExperiment = await db.user_experiments.findFirst({
        where: {
            user_id: parseInt(userId),
            project_group_id: projectGroupId,
            experiment_id: {
                not: null,
            },
        },
    });
    if (!userExperiment) {
        // TODO 用户未进行过实验
    }
    const lastExperiment = await db.experiment.findFirst({
        where: {
            nano_id: userExperiment?.experiment_id,
        },
    });

    return lastExperiment;
}
