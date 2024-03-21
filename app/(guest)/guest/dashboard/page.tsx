import './styles.css';
import { DashboardHeader } from '@/components/dashboard-header';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getUserGroupExperiments } from '@/lib/user_experiment';
import ExperimentTimeline from '@/components/experiment/timeline/experiment-timeline';
import { logger } from '@/lib/logger';

// 获取用户在当前项目中的分组实验内容
// 1. 如果用户从未登陆，则查看是否当前项目，否则显示当前时间尚未开放实验
// 2. 如果有当前项目，但是没有分组，则查看是否有项目分组，如果没有则显示当前时间无可用分组
// 3. 如果有项目分组，随机选择分组，并则查看是否有对应实验，如果没有则显示当前时间无可用实验
// 4. 如果有对应实验，则返回实验内容

interface GuestDashboardProps {
    guestUserId: number;
}

export default async function GuestDashboard({ guestUserId }: GuestDashboardProps) {
    // 获取用户默认的实验
    if (guestUserId) {
        redirect('/login');
    }

    // TODO 查看用户下次实验记录时间以及是否需要开始下次实验
    const { experiment_id: experimentId } = await getUserGroupExperiments();
    logger.info(`<临时用户${guestUserId}> 需要进行实验 ${experimentId}`);

    if (!experimentId) {
        redirect('/guest/closed');
    }

    return (
        <>
            <div className="container mx-auto">
                <div className="flex flex-col gap-4">
                    <DashboardHeader heading="控制台" text="用户相关操作页面" />
                    <ExperimentTimeline experimentId={experimentId} userId={guestUserId} />
                </div>
            </div>
        </>
    );
}
