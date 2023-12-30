import { DashboardHeader } from '@/components/dashboard-header'
import { ExperimentStarter } from '@/components/experiment/experiment-starter'
import { ExperimentStarterButtons } from '@/components/experiment/experiment-starter-buttons'
import './styles.css'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

type UserExperimentId = {
    experiment_name: string
    description: string
    nano_id: string
}

async function getUserExperiment(userId: BigInt) {
    const result = await db.$queryRaw<UserExperimentId[]>`
    select experiment_name, 'description', nano_id
    from psy_experiment
    where id = (select experiment_id
    from psy_user_group g
    left join psy_map_user_group m on m.group_id = g.id
    where m.user_id = ${userId})
    and available = 1
    `
    if (result.length > 0) {
        return result[0]
    }
    return undefined
}

export default async function Dashboard() {

    const currentUser = await getCurrentUser()
    let experiment = undefined
    if (currentUser?.id) {
        experiment = await getUserExperiment(BigInt(currentUser?.id))
    }

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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
