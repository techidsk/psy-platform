import { DashboardHeader } from '@/components/dashboard-header';
import { ExperimentCreateButton } from '@/components/experiment/experiment-create-button';
import { State } from '@/components/state';
import { Table } from '@/components/table';
import { dateFormat } from '@/lib/date';
import { getCurrentUser } from '@/lib/session';
import { TableConfig } from '@/types/table';
import { db, convertBigIntToString } from '@/lib/db';

async function getExperiments() {
    const currentUser = await getCurrentUser()
    if (!currentUser?.id) {
        return []
    }
    const experiments = await db.psy_experiment.findMany({
        where: {
            creator: BigInt(currentUser?.id)
        }
    })
    return experiments.map(e => (convertBigIntToString(e)))
}

/**实验管理 */
export default async function ExperimentList() {
    const datas = await getExperiments()

    return (
        <div className='container mx-auto'>
            <div className='flex flex-col gap-4'>
                <DashboardHeader heading="实验管理" text="创建新实验或者更新实验设置">
                    <ExperimentCreateButton className='btn btn-primary btn-sm' />
                </DashboardHeader>
                <div className='w-full overflow-auto'>
                    <Table configs={experimentTableConfig} datas={datas} />
                </div>
            </div>
        </div>
    )
}

const experimentTableConfig: TableConfig[] = [
    {
        key: 'experiment_name',
        label: '实验名称',
        children: (data: any) => {
            return <div className='flex flex-col gap-2'>
                <span>
                    {data.experiment_name}
                </span>
            </div>
        },
    },
    {
        key: 'create_time',
        label: '创建时间',
        children: (data: any) => {
            return <div className='flex flex-col gap-2'>
                <span>{dateFormat(data.create_time)}</span>
            </div>
        },
    },
    {
        key: 'available',
        label: '状态',
        children: (data: any) => {
            let text = Boolean(data.available) ? '可用' : '暂停'
            return <State type='success'>
                {text}
            </State>
        },
    },
    {
        key: 'id',
        label: '操作',
        hidden: true,
        children: (data: any) => {
            return <div className='flex gap-4 items-center'>

            </div>
        },
    }
]