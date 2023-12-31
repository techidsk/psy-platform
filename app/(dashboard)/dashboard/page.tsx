import { DashboardHeader } from '@/components/dashboard-header'
import { ExperimentStarter } from '@/components/experiment/experiment-starter'
import { ExperimentStarterButtons } from '@/components/experiment/experiment-starter-buttons'
import './styles.css'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { CenteredHero } from '@/components/experiment/modules/centerd-hero'

type UserExperimentId = {
    experiment_name: string
    description: string
    nano_id: string
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
    `
    if (result.length > 0) {
        return result[0]
    }
    return undefined
}

export default async function Dashboard() {


    // 获取用户默认的实验
    const currentUser = await getCurrentUser()
    let experiment = undefined
    if (currentUser?.id) {
        experiment = await getUserExperiment(parseInt(currentUser?.id))
    }



    const content = `欢迎参加我们的心理测验。在这个测验中，您将被要求在我们的文本框内畅所欲言，分享您的想法和感受。您可以使用回车或者句号做为结尾，我们会为您生成一张图片。请注意，您不需要等待图片的生成，可以尽情输入，直到您感觉已经表达了您的内心世界。

    在这个测验中，我们希望了解您的情感、想法和行为。您的回答将被用于研究和分析，以帮助我们更好地了解人类心理。请放心地表达您的内心世界，我们会认真听取并理解您的每一个诉求。
    
    当您输入完毕后，点击完成即可完成测验。请注意，您的个人信息和数据将被严格保密，只有研究团队成员才能访问它们。如果您有任何疑问或意见，请随时与我们联系。感谢您的参与！`

    return (
        <div className='container mx-auto'>
            <div className='flex flex-col gap-4'>
                <DashboardHeader heading="控制台" text="用户相关操作页面" />
                <div className='p-2'>
                    <div className="hero">
                        <div className="hero-content text-center">
                            <div className="max-w-md">
                                <ExperimentStarter title={experiment?.experiment_name || '实验名称'}>
                                    <ExperimentStarterButtons experimentId={experiment?.nano_id} />
                                </ExperimentStarter>
                                <CenteredHero title='哈哈哈 我是无敌的' content={content}>
                                    <ExperimentStarterButtons experimentId={experiment?.nano_id} />
                                </CenteredHero>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
