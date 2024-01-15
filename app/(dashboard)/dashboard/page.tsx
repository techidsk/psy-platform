import { DashboardHeader } from '@/components/dashboard-header';
import { ExperimentStarterButtons } from '@/components/experiment/experiment-starter-buttons';
import './styles.css';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { CenteredHero } from '@/components/experiment/modules/centerd-hero';
import { redirect } from 'next/navigation';

type UserExperimentId = {
    experiment_name: string;
    description: string;
    nano_id: string;
};

// 获取用户在当前项目中的分组实验内容
// 1. 如果用户从未登陆，则查看是否当前项目，否则显示当前时间尚未开放实验
// 2. 如果有当前项目，但是没有分组，则查看是否有项目分组，如果没有则显示当前时间无可用分组
// 3. 如果有项目分组，随机选择分组，并则查看是否有对应实验，如果没有则显示当前时间无可用实验
// 4. 如果有对应实验，则返回实验内容
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

        // 获取对应的实验列表以及实验顺序
        const experimentTimes = userGroup.project_experiment_times || 0;
        if (!experimentList[experimentTimes]) {
            throw new Error('已经完成所有实验');
            // TODO 提示用户已经完成所有实验1
        }
        return experimentList[experimentTimes].experiment_id;
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
        return experimentList[0].experiment_id;
    }
}

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

async function getUserExperiment(userId: number) {
    const result = await db.$queryRaw<UserExperimentId[]>`
    select experiment_name, 'description', nano_id
    from experiment
    where id = (select experiment_id
    from user_group g
    left join map_user_group m on m.group_id = g.id
    where m.user_id = ${userId})
    and available = 1
    `;
    if (result.length > 0) {
        return result[0];
    }
    return undefined;
}

export default async function Dashboard() {
    // 获取用户默认的实验
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
        redirect('/login');
    }
    const userId = parseInt(currentUser?.id);
    // 1. 如果用户从未登陆，则查看是否当前项目，否则显示当前时间尚未开放实验
    const project = await findProject();

    // 2. 判断用户是否已经在已有的项目分组中, 获取用户当前的实验
    const experimentId = await findProjectGroup(userId, project.id);

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
                </div>
            </div>
        </div>
    );
}
