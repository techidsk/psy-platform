import { DashboardHeader } from '@/components/dashboard-header';
import { State } from '@/components/state';
import { Table } from '@/components/table/table';
import { dateFormat } from '@/lib/date';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { TableConfig } from '@/types/table';
import { ExperimentDetailButton } from '@/components/experiment/experiment-detail-button';
import SubpageHeader from '@/components/subpage-header';
import TableCheckbox from '@/components/table/table-checkbox';
import { ExperimentTableConfirmButton } from '@/components/experiment/experiment-table-comfirm-button';
import Pagination from '@/components/pagination';
import { experiment as ExperimentTableProps } from '@prisma/client';

async function getExperiments(
    searchParams: { [key: string]: string | undefined },
    page: number = 1,
    pageSize: number = 10
) {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
        return [];
    }

    const experiments = await db.$queryRaw<ExperimentTableProps[]>`
        SELECT * from experiment
        WHERE creator = ${parseInt(currentUser?.id)}
        LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
    `;

    return experiments;
}

const itemName = 'project-group-add-experiment';
// const itemName = 'project-group-add-experiment';
// 获取实验列表用于关联对应的项目
export default async function ProjectAddExperiment({
    searchParams,
}: {
    searchParams: { [key: string]: string };
}) {
    const currentPage = searchParams.page ? parseInt(searchParams.page) || 1 : 1;
    const currentPageSize = searchParams.pagesize ? parseInt(searchParams.pagesize) || 10 : 10;
    const datas = await getExperiments(searchParams, currentPage, currentPageSize);

    let end = currentPage;
    if (datas.length === currentPageSize) {
        end = currentPage + 1;
    }

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
                    <Table configs={experimentTableConfig} datas={datas}>
                        <Pagination current={currentPage} pageSize={currentPageSize} end={end} />
                    </Table>
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
