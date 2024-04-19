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

export default async function Dashboard() {
    // 获取用户默认的实验
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
        redirect('/login');
    }
    const needExperiment = currentUser.role === 'USER';

    // TODO 查看用户下次实验记录时间以及是否需要开始下次实验
    if (!needExperiment) {
        redirect('/dashboard');
    }

    const { experiment_id: nextExperimentId, project_group_id: projectGroupId } =
        await getUserGroupExperiments();

    if (!nextExperimentId) {
        redirect('/closed');
    }
    if (!projectGroupId) {
        redirect('/closed');
    }

    const result = await findLastExperiment(currentUser.id, projectGroupId);
    const needWait = result?.status || false;
    const timeStamp = result.timeStamp;
    logger.info(`<用户${currentUser.id}> 需要等待 ${timeStamp} 进行实验 ${nextExperimentId}`);
    if (needWait) {
        redirect(`/dashboard/wait?t=${timeStamp}`);
    }
    logger.info(`<用户${currentUser.id}> 需要进行实验 ${nextExperimentId}`);

    return (
        <>
            <div className="container mx-auto">
                <div className="flex flex-col gap-4">
                    <DashboardHeader heading="控制台" text="用户相关操作页面" />
                    {needExperiment && (
                        <ExperimentTimeline
                            nextExperimentId={nextExperimentId}
                            userId={parseInt(currentUser.id)}
                            guest={false}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
