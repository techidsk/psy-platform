import { DashboardHeader } from '@/components/dashboard-header';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { findLastExperiment, getUserGroupExperiments } from '@/lib/user_experiment';
import ExperimentTimeline from '@/components/experiment/timeline/experiment-timeline';
import { logger } from '@/lib/logger';

// 获取用户在当前项目中的分组实验内容
// 1. 如果用户从未登陆，则查看是否当前项目，否则显示当前时间尚未开放实验
// 2. 如果有当前项目，但是没有分组，则查看是否有项目分组，如果没有则显示当前时间无可用分组
// 3. 如果有项目分组，随机选择分组，并则查看是否有对应实验，如果没有则显示当前时间无可用实验
// 4. 如果有对应实验，则返回实验内容
interface DashboardProps {
    searchParams: { [key: string]: string };
}

export default async function DashboardHome({ searchParams }: DashboardProps) {
    // 获取用户默认的实验
    const currentIndex = searchParams['step_idx'] ? parseInt(searchParams['step_idx']) : 1;
    const userExperimentNanoId = searchParams['nano_id'] || '';

    // 未登录
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
        redirect('/login');
    }

    // 用户错误跳转
    const needExperiment = currentUser.role === 'USER';
    if (!needExperiment) {
        redirect('/dashboard');
    }

    const currentUserId = parseInt(currentUser.id);
    // 获取下一组实验 id 以及用户被分配到的项目分组 project_group 表中的 id
    const { experiment_id: nextExperimentId, project_group_id: projectGroupId } =
        await getUserGroupExperiments();

    if (currentIndex == 1) {
        // 没有下一组实验
        if (!nextExperimentId) {
            logger.error(`<用户${currentUserId}> 没有下一组实验`);
            redirect('/closed');
        }
        // 没获取到分组
        if (!projectGroupId) {
            logger.error(`<用户${currentUserId}> 没有获取到分组`);
            redirect('/closed');
        }
    }

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
