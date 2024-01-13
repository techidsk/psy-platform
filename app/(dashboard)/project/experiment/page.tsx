import { DashboardHeader } from '@/components/dashboard-header';
import { State } from '@/components/state';
import { Table } from '@/components/table';
import { dateFormat } from '@/lib/date';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { TableConfig } from '@/types/table';
import { ExperimentDetailButton } from '@/components/experiment/experiment-detail-button';
import SubpageHeader from '@/components/subpage-header';
import TableCheckbox from '@/components/table-checkbox';
import { ExperimentTableConfirmButton } from '@/components/experiment/experiment-table-comfirm-button';

async function getExperiments() {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
        return [];
    }
    const experiments = await db.experiment.findMany({
        where: {
            creator: parseInt(currentUser?.id),
        },
    });
    return experiments;
}
const itemName = 'project-group-add-experiment';

// 获取实验列表用于关联对应的项目
export default async function ProjectAddExperiment() {
    const datas = await getExperiments();

    return (
        <div className="container mx-auto">
            <SubpageHeader />
            <div className="flex flex-col gap-4">
                <DashboardHeader heading="添加项目实验" text="选择项目关联实验">
                    <ExperimentTableConfirmButton
                        className="btn btn-primary btn-sm"
                        itemName={itemName}
                    />
                </DashboardHeader>
                <div className="w-full overflow-auto">
                    <Table configs={experimentTableConfig} datas={datas} />
                </div>
            </div>
        </div>
    );
}

const experimentTableConfig: TableConfig[] = [
    {
        key: 'checkbox',
        label: '',
        children: (data: any) => {
            return <TableCheckbox data={data} itemName={itemName} />;
        },
    },
    {
        key: 'experiment_name',
        label: '实验名称',
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2">
                    <span>{data.experiment_name}</span>
                </div>
            );
        },
    },
    {
        key: 'create_time',
        label: '创建时间',
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2">
                    <span>{dateFormat(data.create_time)}</span>
                </div>
            );
        },
    },
    {
        key: 'available',
        label: '状态',
        children: (data: any) => {
            let text = Boolean(data.available) ? '可用' : '暂停';
            return <State type="success">{text}</State>;
        },
    },
    {
        key: 'id',
        label: '操作',
        hidden: true,
        children: (data: any) => {
            return (
                <div className="flex gap-4 items-center">
                    <ExperimentDetailButton experiment={data} />
                </div>
            );
        },
    },
];
