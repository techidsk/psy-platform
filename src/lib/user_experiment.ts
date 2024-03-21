import { db } from './db';
import { logger } from './logger';
import { getCurrentUser } from './session';

interface projectGroupResult {
    status: string;
    message?: string;
    experiment_id: number | undefined;
    project_group_id: number | undefined;
}

async function findAvailableProject() {
    const project = await db.projects.findFirst({
        where: {
            state: 'AVAILABLE',
            start_time: { lte: new Date() },
            end_time: { gte: new Date() },
        },
    });
    if (!project) throw new Error('当前时间无可用项目');
    return project;
}

// 判断用户是否已经在已有的项目分组中
async function findUserProjectGroup(userId: number, projectId: number) {
    return db.user_group.findFirst({
        where: { user_id: userId, project_id: projectId },
    });
}

async function findProjectGroupById(userProjectGroupId: number) {
    return db.project_group.findFirst({
        where: {
            id: userProjectGroupId,
            state: 'AVAILABLE',
        },
    });
}

async function findGroupExperiments(userProjectGroupId: number) {
    return db.project_group_experiments.findMany({
        where: { project_group_id: userProjectGroupId },
        select: { experiment_id: true, experiment_index: true },
        orderBy: { experiment_index: 'asc' },
    });
}

async function getRandomProjectGroup(projectId: number): Promise<number> {
    const projectGroups = await db.project_group.findMany({
        where: {
            project_id: projectId,
            state: 'AVAILABLE',
        },
    });
    if (projectGroups?.length === 0) {
        // 返回当前无可用项目分组
        throw new Error('当前时间无可用项目分组');
    }

    // 随机选择一个分组
    const randomGroup = projectGroups[Math.floor(Math.random() * projectGroups.length)];
    return randomGroup.id;
}

async function findProjectGroup(
    userId: number,
    projectId: number,
    guest: boolean
): Promise<projectGroupResult> {
    // 判断用户是否有对应的项目分组
    const userGroup = await findUserProjectGroup(userId, projectId);

    if (userGroup) {
        // 获取对应得分组id以及进行过的试验次数
        const userProjectGroupId = userGroup.project_group_id;
        if (!userProjectGroupId) {
            logger.error(`<用户${userId}> 分配项目分组 ${userProjectGroupId} 不存在@user_group表`);
            throw new Error('用户未分配项目分组');
            // TODO 随机分配用户到对应的项目分组中
        }

        // 获取项目分组属性
        const projectGroup = await findProjectGroupById(userProjectGroupId);
        if (!projectGroup) {
            logger.error(`<用户${userId}> 项目分组 ${userProjectGroupId} 不存在@project_group表`);
            throw new Error('所属分组不存在或者未激活');
        }

        logger.info(
            `<用户${userId}> 已经分配了项目[${userGroup.project_id}] 下的项目分组[${userGroup.project_group_id}]`
        );

        // 查看项目分组对应的所有实验
        const experimentList = await findGroupExperiments(userProjectGroupId);
        logger.info(
            `<用户${userId}>需要完成以下实验 ${experimentList.map((item) => item.experiment_id)} `
        );

        // 获取对应的实验列表以及实验顺序
        const experimentTimes = userGroup.project_experiment_times || 0;
        logger.info(`<用户${userId}> 已完成 ${experimentTimes} 次实验`);
        // 游客用户只有一次实验
        if (guest) {
            if (experimentTimes >= 1) {
                return {
                    status: 'FINISHED',
                    message: '已经完成所有实验',
                    experiment_id: undefined,
                    project_group_id: userProjectGroupId,
                };
            }
        }
        logger.info(
            `<用户${userId}> 下一组实验 ${experimentList[experimentTimes]?.experiment_id} `
        );

        if (!experimentList[experimentTimes]) {
            // TODO 提示用户已经完成所有实验
            return {
                status: 'FINISHED',
                message: '已经完成所有实验',
                experiment_id: undefined,
                project_group_id: userProjectGroupId,
            };
        }

        // TODO 判断是否已经完成本周实验
        return {
            status: 'SUCCESS',
            experiment_id: experimentList[experimentTimes].experiment_id,
            project_group_id: userProjectGroupId,
        };
    } else {
        // 用户在当前项目并没有对应的项目，随机分配用户到对应的项目分组中
        const userProjectGroupId = await getRandomProjectGroup(projectId);
        const experimentList = await findGroupExperiments(userProjectGroupId);
        if (!experimentList[0]) {
            logger.error(`用户分组${userProjectGroupId} 未分配可用实验`);
            throw new Error('暂未分配项目实验');
        }

        // 插入用户到项目分组中
        await db.user_group.create({
            data: {
                user_id: userId,
                project_id: projectId,
                project_group_id: userProjectGroupId,
                state: 1,
            },
        });

        // 返回对应顺序的实验id
        return {
            status: 'SUCCESS',
            experiment_id: experimentList[0].experiment_id,
            project_group_id: userProjectGroupId,
        };
    }
}

/**
 * 获取用户在当前项目中的分组实验
 * @returns
 */
export async function getUserGroupExperiments(guest: boolean = false, guestUserId: number = 0) {
    let userId: number;
    if (!guest) {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('用户未登陆');
        }
        userId = parseInt(user?.id);
    } else {
        if (guestUserId <= 0) {
            throw new Error('未指定游客ID');
        }
        userId = guestUserId;
    }

    // TODO 需要支持同时激活多个项目
    const currentProject = await findAvailableProject();
    logger.info(`当前激活的项目: [${currentProject.project_name}]@<${currentProject?.id}>`);
    const response = await findProjectGroup(userId, currentProject?.id, guest);

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
