import { DashboardHeader } from '@/components/dashboard-header';
import { ExperimentStarterButtons } from '@/components/experiment/experiment-starter-buttons';
import { db } from '@/lib/db';
import { getCurrentUser, getUserGroupExperiments } from '@/lib/session';
import { CenteredHero } from '@/components/experiment/modules/centerd-hero';
import { redirect } from 'next/navigation';

import './styles.css';
import { LeftImageHero } from '@/components/experiment/modules/left-image-hero';

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

export default async function Dashboard() {
    // 获取用户默认的实验
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
        redirect('/login');
    }
    const { experiment_id: experimentId } = await getUserGroupExperiments();
    if (!experimentId) {
        redirect('/closed');
    }
    const experiment = await getExperiment(experimentId);
    const title = experiment?.experiment_name || '默认实验';
    const content = experiment.intro || `欢迎参加我们的心理测验。`;

    return (
        <div className="container mx-auto">
            <div className="flex flex-col gap-4">
                <DashboardHeader heading="控制台" text="用户相关操作页面" />
                <div className="p-2">
                    <div className="hero">
                        <div className="hero-content text-center">
                            <div className="max-w-md">
                                <CenteredHero title={title} content={content}>
                                    <ExperimentStarterButtons
                                        experimentId={experiment?.nano_id || ''}
                                    />
                                </CenteredHero>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
