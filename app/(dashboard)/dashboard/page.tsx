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

    const content = `欢迎参加我们的心理测验。在这个测验中，您将被要求在我们的文本框内畅所欲言，分享您的想法和感受。您可以使用回车或者句号做为结尾，我们会为您生成一张图片。请注意，您不需要等待图片的生成，可以尽情输入，直到您感觉已经表达了您的内心世界。

    在这个测验中，我们希望了解您的情感、想法和行为。您的回答将被用于研究和分析，以帮助我们更好地了解人类心理。请放心地表达您的内心世界，我们会认真听取并理解您的每一个诉求。
    
    当您输入完毕后，点击完成即可完成测验。请注意，您的个人信息和数据将被严格保密，只有研究团队成员才能访问它们。如果您有任何疑问或意见，请随时与我们联系。感谢您的参与！`;

    return (
        <div className="container mx-auto">
            <div className="flex flex-col gap-4">
                <DashboardHeader heading="控制台" text="用户相关操作页面" />
                <div className="p-2">
                    <div className="hero">
                        <div className="hero-content text-center">
                            <div className="max-w-md">
                                <CenteredHero
                                    title={experiment?.experiment_name || '实验名称'}
                                    content={content}
                                >
                                    <ExperimentStarterButtons
                                        experimentId={experiment?.nano_id || ''}
                                    />
                                </CenteredHero>
                            </div>
                        </div>
                    </div>

                    <LeftImageHero
                        title={experiment?.experiment_name || '实验名称'}
                        content={content}
                        size="md"
                    >
                        <ExperimentStarterButtons experimentId={experiment?.nano_id || ''} />
                    </LeftImageHero>
                </div>
            </div>
        </div>
    );
}
