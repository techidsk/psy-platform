import { DashboardHeader } from '@/components/dashboard-header';
import ExperimentTimeline from '@/components/experiment/timeline/experiment-timeline';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getCurrentUser } from '@/lib/session';
import {
    findCallbackUserExperiment,
    findLastExperiment,
    getUserGroupExperiments,
} from '@/lib/user_experiment';
import { redirect } from 'next/navigation';

// 获取用户在当前项目中的分组实验内容
// 1. 如果用户从未登陆，则查看是否当前项目，否则显示当前时间尚未开放实验
// 2. 如果有当前项目，但是没有分组，则查看是否有项目分组，如果没有则显示当前时间无可用分组
// 3. 如果有项目分组，随机选择分组，并则查看是否有对应实验，如果没有则显示当前时间无可用实验
// 4. 如果有对应实验，则返回实验内容
interface DashboardProps {
    searchParams: { [key: string]: string };
}
async function getExperiment(
    currentUserId: number,
    userExperimentNanoId: string,
    currentIndex: number
) {
    const user = await db.user.findUnique({
        where: {
            id: currentUserId,
        },
    });
    const userNanoId = user?.nano_id || '';
    let nextExperimentId = 0;
    let experiment_status = '';
    let userId = currentUserId;
    try {
        if (userExperimentNanoId !== '') {
            // 从Callback进入实验,证明实验并未完成
            logger.info('<临时用户> 从Callback进入实验');
            let response = await findCallbackUserExperiment(userNanoId, userExperimentNanoId);
            nextExperimentId = response?.experiment_id || 0;
            userId = response?.user_id || 0;
        } else {
            let response = await getUserGroupExperiments();
            nextExperimentId = response?.experiment_id || 0;
            userId = response?.user_id || 0;
            experiment_status = response?.experiment_status;

            if (nextExperimentId == 0) {
                logger.error(`<临时用户${userNanoId}> 没有可用的实验`);
                redirect('/closed/30001');
            }

            if (experiment_status == 'FINISH') {
                logger.error(`<临时用户${userNanoId}> 已经完成实验`);
                redirect('/closed/30003');
            }

            logger.info(`<临时用户${userNanoId}> 需要进行实验${nextExperimentId}`);

            if (!userId) {
                logger.error(`<临时用户${userNanoId}> 未找到合法userId`);
                redirect('/closed/30002');
            }

            const projectGroupId = response?.project_group_id || 0;
            // 需要处理是否进入下一步还是进入等待实验
            const result = await findLastExperiment(
                currentUserId,
                projectGroupId,
                userExperimentNanoId,
                currentIndex
            );

            const needWait = result?.status || false;
            const timeStamp = result.timeStamp;
            if (needWait) {
                redirect(`/dashboard/wait?t=${timeStamp}`);
            }
        }
    } catch (error: Error | any) {
        logger.error(`处理用户实验时发生错误: ${error.message}`);
        // 根据实际需求处理错误，比如重定向到错误页面或者返回错误信息
    }

    return { nextExperimentId, userId };
}

export default async function DashboardHome({ searchParams }: DashboardProps) {
    // 未登录
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
        redirect('/');
    }

    // 用户错误跳转
    const needExperiment = currentUser.role === 'USER';
    if (!needExperiment) {
        redirect('/dashboard');
    }

    // 获取用户默认的实验
    const currentIndex = searchParams['step_idx'] ? parseInt(searchParams['step_idx']) : 1;
    const userExperimentNanoId = searchParams['nano_id'] || '';

    const currentUserId = parseInt(currentUser.id);

    // 获取下一组实验 id 以及用户被分配到的项目分组 project_group 表中的 id
    // const { experiment_id: nextExperimentId, project_group_id: projectGroupId } =
    //     await getUserGroupExperiments();

    // 同样要判断是否是已经完成实验还是通过 callback 继续实验
    const { nextExperimentId, userId } = await getExperiment(
        currentUserId,
        userExperimentNanoId,
        currentIndex
    );
    // if (currentIndex == 1) {
    //     // 没有下一组实验
    //     if (!nextExperimentId) {
    //         logger.error(`<用户${currentUserId}> 没有下一组实验`);
    //         redirect('/closed');
    //     }
    //     // 没获取到分组
    //     if (!projectGroupId) {
    //         logger.error(`<用户${currentUserId}> 没有获取到分组`);
    //         redirect('/closed');
    //     }
    // }

    return (
        <>
            <div className="container mx-auto">
                <div className="flex flex-col gap-4">
                    <DashboardHeader heading="控制台" text="用户相关操作页面" />
                    {needExperiment && (
                        <ExperimentTimeline
                            nextExperimentId={nextExperimentId}
                            userId={currentUserId}
                            guest={false}
                            stepIndex={currentIndex}
                            userExperimentNanoId={userExperimentNanoId}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
