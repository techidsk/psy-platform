import dayjs from 'dayjs';
import { db } from './db';
import { logger } from './logger';
import { getCurrentUser } from './session';

interface projectGroupResult {
    status: number;
    message?: string;
    experiment_id: number; // 下一组实验ID
    project_group_id: number; // 用户所属的项目分组id
    user_id?: number; // 用户id
    experiment_status: string; // 实验状态
}

interface experimentState {
    experiment_id: number;
    completion_status: string;
    finish_time: string; // 时间格式为 2021-08-01 12:00:00
}

/**
 * 获取用户的 user_group 的id 在 user_group 表中
 * @param userId    用户id
 * @param projectId     项目id
 * @returns 返回项目分组ID 或者 null
 */
async function getUserProjectGroupId(userId: number, projectId: number) {
    const userGroup = await db.user_group.findFirst({
        where: { user_id: userId, project_id: projectId },
    });
    if (userGroup) {
        return {
            userGroupId: userGroup.id,
            userProjectGroupId: userGroup.project_group_id,
        };
    }
    const userProjectGroupId = await getRandomProjectGroup(projectId);
    // 插入用户到项目分组中
    const newUserGroup = await db.user_group.create({
        data: {
            user_id: userId,
            project_id: projectId,
            project_group_id: userProjectGroupId,
            state: 1,
        },
    });
    return {
        userGroupId: newUserGroup.id,
        userProjectGroupId: userProjectGroupId,
    };
}

/**
 * 获取项目分组下的所有实验
 * @param userProjectGroupId
 * @returns
 */
async function findGroupExperiments(userProjectGroupId: number) {
    const experiments = await db.project_group_experiments.findMany({
        where: { project_group_id: userProjectGroupId },
        select: { experiment_id: true, experiment_index: true },
        orderBy: { experiment_index: 'asc' },
    });
    logger.info(`需要完成以下实验 ${experiments.map((item) => item.experiment_id)} `);
    return experiments;
}

/**
 * 获取用户实验进度
 *
 * @param projectGroupId    项目分组ID
 * @returns     72,NOT COMPLETED，2023-08-01 12:00:00
 */
async function getUserExperimentsState(projectGroupId: number, userId: number) {
    const experiments = await db.$queryRaw<experimentState[]>`
        SELECT es.experiment_id,
            SUBSTRING_INDEX(GROUP_CONCAT(ue.finish_time ORDER BY es.order DESC), ',', 1) AS finish_time,
            IF(COUNT(*) = COUNT(ue.finish_time), 'COMPLETED', 'NOT COMPLETED') AS completion_status
        FROM project_group_experiments pge
        LEFT JOIN experiment_steps es ON es.experiment_id = pge.experiment_id
        LEFT JOIN user_experiments ue ON ue.experiment_id = es.experiment_id AND ue.part = es.order AND ue.user_id = ${userId}
        WHERE pge.project_group_id = ${projectGroupId} AND es.type = 4
        GROUP BY es.experiment_id;
    `;
    return experiments;
}

/**
 * 随机获取项目分组 id
 * @param projectId
 * @returns 项目分组id
 */
async function getRandomProjectGroup(projectId: number): Promise<number> {
    // 获取当前项目下的所有可用分组
    const projectGroups = await db.project_group.findMany({
        where: {
            project_id: projectId,
            state: 'AVAILABLE',
        },
    });

    if (projectGroups?.length === 0) {
        throw new Error(`当前时间无可用项目分组 -> ${projectId}`);
    }

    // 随机选择一个分组
    // TODO 分组需要优化
    const randomGroup = projectGroups[Math.floor(Math.random() * projectGroups.length)];
    return randomGroup.id;
}

/**
 * TODO 这里返回的 experiment_id 是错误的
 * 获取用户项目分组信息
 * @param userId
 * @param projectId
 * @param guest
 * @returns
 */
async function findProjectGroup(
    userId: number,
    projectId: number,
    guest: boolean
): Promise<projectGroupResult> {
    // 判断用户是否有对应的项目分组
    try {
        const { userProjectGroupId } = await getUserProjectGroupId(userId, projectId);
        logger.info(
            `<用户${userId}> 已经分配了项目[${projectId}] 下的项目分组[${userProjectGroupId}]`
        );
        if (!userProjectGroupId) {
            logger.error(`<用户${userId}> 未分配到项目分组, userProjectGroupId 为空`);
            throw new Error('未分配到项目分组');
        }

        const experimentList = await findGroupExperiments(userProjectGroupId);
        if (!experimentList[0]) {
            logger.error(`<用户${userId}> 被分配的 项目分组[${userProjectGroupId}] 未分配可用实验`);
            throw new Error('暂未分配项目实验');
        }

        const userExperimentState = await getUserExperimentsState(userProjectGroupId, userId);
        logger.info(`<用户${userId}> 实验进度: ${JSON.stringify(userExperimentState)}`);
        // 判断用户实验进度, 获得已经完成实验总次数
        const totalFinishedExperimentCount = userExperimentState.filter(
            (item) => item.completion_status === 'COMPLETED'
        ).length;

        // 游客用户只有一次实验
        if (guest) {
            if (totalFinishedExperimentCount >= 1) {
                logger.warn(`<游客${userId}> 已经完成所有实验`);

                // 返回游客用户的上次实验记录
                return {
                    status: 200,
                    message: '已经完成所有实验',
                    experiment_id: userExperimentState[0].experiment_id, // 为了保证可以跳转到最后的步骤
                    project_group_id: userProjectGroupId,
                    experiment_status: 'FINISH',
                };
            }
        }

        logger.info(`<用户${userId}> 已经完成了 ${totalFinishedExperimentCount} 次，剩余实验: `);
        logger.info(experimentList);

        logger.info(
            `<用户${userId}> 下一组实验 ${experimentList[totalFinishedExperimentCount]?.experiment_id} `
        );

        if (!experimentList[totalFinishedExperimentCount]) {
            return {
                status: 200,
                message: '已经完成所有实验',
                experiment_id: 0,
                project_group_id: userProjectGroupId,
                experiment_status: 'FINISH',
            };
        }

        return {
            status: 200,
            experiment_id: experimentList[totalFinishedExperimentCount].experiment_id,
            project_group_id: userProjectGroupId,
            experiment_status: 'NOT_FINISH',
        };
    } catch (error: Error | any) {
        logger.error(`用户${userId} 获取实验信息时出现错误 :${error}`);
        return {
            status: 500,
            message: error.message || '未分配到项目分组',
            experiment_id: 0,
            project_group_id: 0,
            experiment_status: 'ERROR',
        };
    }
}

/**
 * 获取用户在当前项目中的分组实验
 * @returns
 */
export async function getUserGroupExperiments(
    guest: boolean = false,
    guestUserNanoId: string = '',
    inviteCode: string = ''
): Promise<projectGroupResult> {
    try {
        if (inviteCode !== '' && inviteCode.length !== 21) {
            throw new Error(`非法的邀请码: ${inviteCode}`);
        }

        let userId: number;
        let guestUser;
        if (guest) {
            if (guestUserNanoId === '') {
                throw new Error('未指定游客ID');
            }
            guestUser = await db.user.findFirst({
                where: { nano_id: guestUserNanoId },
            });
            if (!guestUser) {
                logger.warn('未找到对应的游客用户, 创建新用户');
                guestUser = await db.user.create({
                    data: {
                        nano_id: guestUserNanoId,
                        user_role: 'GUEST',
                        username: guestUserNanoId,
                        invite_code: inviteCode,
                    },
                });
            }
            userId = guestUser.id;
        } else {
            const user = await getCurrentUser();
            if (!user) {
                logger.error('用户未登陆');
                throw new Error('用户未登陆');
            }
            userId = parseInt(user?.id);

            guestUser = await db.user.findFirst({
                where: { id: userId },
            });
        }

        const projectInviteCode = inviteCode || guestUser?.invite_code;
        // 获取用户当前的项目
        const currentProject = await db.projects.findFirst({
            where: {
                invite_code: projectInviteCode,
            },
        });
        if (!currentProject) {
            logger.error(`未找到项目: [${projectInviteCode}]`);
            throw new Error(`邀请码未找到相关项目，请联系管理员`);
        }

        if (currentProject.state !== 'AVAILABLE') {
            logger.error(
                `项目已经关闭: [Project: ${currentProject.id} | ${currentProject.project_name}]`
            );
            throw new Error(`本项目未开启实验或者已经完成实验`);
        }

        if (currentProject.start_time && currentProject.start_time > new Date()) {
            logger.error(
                `项目还未开始: [Project: ${currentProject.id} | ${currentProject.project_name}]`
            );
            throw new Error(
                `项目还未开始，请在项目开始时间后再进行实验: ${currentProject.start_time}`
            );
        }

        if (currentProject.end_time && currentProject.end_time < new Date()) {
            logger.error(
                `项目已经结束: [Project: ${currentProject.id} | ${currentProject.project_name}]`
            );
            throw new Error(`项目已经结束, 请联系管理员`);
        }

        logger.info(`当前激活的项目: [${currentProject.project_name}]@<${currentProject?.id}>`);

        // 获取用户当前的项目分组
        const response = await findProjectGroup(userId, currentProject?.id, guest);
        response['user_id'] = userId;
        return response;
    } catch (error: Error | any) {
        logger.error(`获取用户实验信息时出现错误 :${error}`);
        return {
            status: 500,
            message: error.message || '未分配到项目分组',
            experiment_id: 0,
            project_group_id: 0,
            experiment_status: 'ERROR',
        };
    }
}

/**
 * 判断是否需要等待实验完成以及等待时间
 * @param userId
 * @param projectGroupId
 * @param currentExperimentNanoId 当前正在进行的实验的nanoId
 * @param currentIndex 当前实验的 step_idx
 * @returns
 */
export async function findLastExperiment(
    userId: number,
    projectGroupId: number,
    currentExperimentNanoId: string,
    currentIndex: number
) {
    // 先判断是否是第一步
    if (currentIndex !== 1) {
        logger.info('不是第一步，不需要等待');
        return {
            status: false,
            timeStamp: 0,
        };
    }
    // 如果是第一步，默认跳转过来，需要判断是否存在 currentExperimentNanoId
    // 否则证明是在实验中，不需要等待
    if (currentExperimentNanoId) {
        return {
            status: false,
            timeStamp: 0,
        };
    }

    // 如果没有 currentExperimentNanoId
    // 需要获取下一组实验 id

    // 判断用户是否完成最后一次实验的流程
    // 获取所有分组中所有实验
    // const currentExperiment = await db.user_experiments.findFirst({
    //     where: { nano_id: currentExperimentNanoId },
    // });

    // if (!currentExperiment || !currentExperiment.id || !currentExperiment.experiment_id) {
    //     logger.error(`未找到当前实验: ${currentExperimentNanoId} 相关信息，继续实验`);
    //     return {
    //         status: false,
    //         timeStamp: 0,
    //     };
    // }

    // 获取当前实验的ID
    // const currentExperimentId = currentExperiment.experiment_id;

    // 获取用户所有实验进展
    const userExperimentsState = await getUserExperimentsState(projectGroupId, userId);

    const finishedExperiments = userExperimentsState.find(
        (item) => item.completion_status === 'COMPLETED'
    );

    const finishTime = finishedExperiments?.finish_time;

    // 从 experiments 中找到当前实验的状态
    // const currentExperimentState = userExperimentsState.find(
    //     (item) => item.experiment_id == parseInt(currentExperimentId)
    // );
    // if (!currentExperimentState) {
    //     logger.error(`未找到当前实验: ${currentExperimentId} 相关信息，继续实验`);
    //     return {
    //         status: false,
    //         timeStamp: 0,
    //     };
    // }
    // // 如果实验还未完成，则继续实验
    // if (currentExperimentState?.completion_status === 'NOT COMPLETED') {
    //     logger.error(`当前实验: ${currentExperimentId} 未完成，继续实验`);
    //     return {
    //         status: false,
    //         timeStamp: 0,
    //     };
    // }

    // 如果已经完成本组实验，获取最后一个实验的完成时间
    const lastExperimentTime = finishTime ? new Date(finishTime).getTime() : 0;
    const currentTimeStamp = new Date().getTime();
    const timeStampDiffMinuts = Math.floor((currentTimeStamp - lastExperimentTime) / 1000 / 60); // 分钟数

    const projectGroup = await db.project_group.findFirst({
        where: {
            id: projectGroupId,
        },
        select: {
            gap: true,
        },
    });

    const gap =
        projectGroup?.gap !== null && projectGroup?.gap !== undefined ? projectGroup.gap : 3; // 实验间隔默认3小时

    logger.info(`上次实验开始时间: ${finishTime}`);
    logger.info(`当前访问实验时间: ${dayjs(currentTimeStamp).format('YYYY-MM-DD HH:mm:ss')}`);
    logger.info(`实验间隔时间共计: ${timeStampDiffMinuts} 分, 需要等待时间 ${gap * 60} 分`);
    if (timeStampDiffMinuts < gap * 60) {
        logger.info(`当前实验需要等待，跳过实验`);

        return {
            status: true,
            timeStamp: gap * 60 * 60 * 1000 - (currentTimeStamp - lastExperimentTime),
        };
    }

    return {
        status: false,
        timeStamp: 0,
    };
}

export async function findCallbackUserExperiment(userNanoId: string, userExperimentNanoId: string) {
    const user = await db.user.findFirst({
        where: { nano_id: userNanoId },
    });
    if (!user) {
        logger.error(`未找到用户: ${userNanoId}`);
        return {
            status: 500,
            message: '未找到合法用户，请确认url是否正确',
            user_id: 0,
            experiment_id: 0,
        };
    }

    // 获取用户最后一次写作实验
    const userExperiment = await db.user_experiments.findFirst({
        where: { nano_id: userExperimentNanoId, user_id: user.id },
        orderBy: { id: 'desc' },
    });
    if (!userExperiment || !userExperiment.part) {
        // 用户未进行过实验
        logger.error(`未找到用户实验: ${userExperimentNanoId}`);
        return {
            status: 500,
            message: '未找到用户实验，请确认url是否正确',
            user_id: user.id,
            experiment_id: 0,
        };
    }

    return {
        status: 200,
        user_id: user.id,
        experiment_id: parseInt(userExperiment.experiment_id || '0'),
    };
}
