import { DashboardHeader } from '@/components/dashboard-header';
import { ExperimentCreateButton } from '@/components/experiment/experiment-create-button';
import { State } from '@/components/state';
import { Table } from '@/components/table';
import { dateFormat } from '@/lib/date';
import { getCurrentUser } from '@/lib/session';
import { TableConfig } from '@/types/table';
import { PlayIcon, TrashIcon, PaperPlaneIcon, PlusIcon } from '@radix-ui/react-icons'

async function getExperiments() {
    const currentUser = await getCurrentUser()
    const r = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/experiment/list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: currentUser?.id
        }),
        cache: 'no-store'
    })

    if (!r.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data');
    }
    return r.json();
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
                <Table configs={experimentTableConfig} datas={datas} />
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
                <PlayIcon height={24} width={24} />
                <TrashIcon height={24} width={24} />
                <PaperPlaneIcon height={20} width={20} />
            </div>
        },
    }
]
