import { DashboardHeader } from '@/components/dashboard-header';
import { State } from '@/components/state';
import { Table } from '@/components/table/table';
import { dateFormat } from '@/lib/date';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { TableConfig } from '@/types/table';
import { ExperimentDetailButton } from '@/components/experiment/experiment-detail-button';
import { ExperimentCreateButton } from '@/components/experiment/experiment-create-button';
import Image from 'next/image';
import { TableSearch } from '@/components/table/table-search';
import Pagination from '@/components/pagination';
import { Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';

async function getExperiments(
    searchParams: { [key: string]: string | undefined },
    page: number = 1,
    pageSize: number = 10
) {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
        return [];
    }
    const experiment_name = searchParams?.experiment_name || '';
    const engine_name = searchParams?.engine_name || '';

    const experiments = await db.$queryRaw<any[]>`
        SELECT e.*, engine_image, engine_name
        FROM experiment e 
        LEFT JOIN engine en ON en.id = e.engine_id
        WHERE e.creator = ${currentUser.id}
        ${
            experiment_name
                ? Prisma.sql`AND e.experiment_name LIKE '%${Prisma.raw(experiment_name)}%'`
                : Prisma.empty
        }
        ${
            engine_name
                ? Prisma.sql`AND en.engine_name LIKE '%${Prisma.raw(engine_name)}%'`
                : Prisma.empty
        }
        ORDER BY e.create_time DESC
        LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
    `;

    return experiments;
}

/** 实验流程设计与管理 */
export default async function ExperimentList({
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
            <div className="flex flex-col gap-4">
                <DashboardHeader heading="实验管理" text="创建新实验或者更新实验设置">
                    <ExperimentCreateButton className="btn btn-primary btn-sm" />
                </DashboardHeader>
                <div className="w-full overflow-auto">
                    <Table
                        configs={experimentTableConfig}
                        datas={datas}
                        searchNode={
                            <TableSearch defaultParams={searchParams} searchDatas={searchDatas} />
                        }
                    >
                        <Pagination current={currentPage} pageSize={currentPageSize} end={end} />
                    </Table>
                </div>
            </div>
        </div>
    );
}

const experimentTableConfig: TableConfig[] = [
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
        key: 'engine_id',
        label: '使用引擎',
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2 justify-center">
                    <Image
                        className="rounded"
                        src={data.engine_image}
                        alt={data.engine_name}
                        width={48}
                        height={48}
                    />
                    <div className="text-gray-700">{data.engine_name}</div>
                </div>
            );
        },
    },
    {
        key: 'countdown',
        label: '实验时间',
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2">
                    <div>{data.countdown}分钟</div>
                </div>
            );
        },
    },
    {
        key: 'pic_mode',
        label: '开启图片',
        children: (data: any) => {
            let text = Boolean(data.pic_mode) ? '开启' : '关闭';
            let type = Boolean(data.pic_mode) ? 'success' : 'warn';
            return <State type={type}>{text}</State>;
        },
    },
    {
        key: 'available',
        label: '状态',
        children: (data: any) => {
            let text = Boolean(data.available) ? '可用' : '暂停';
            let type = Boolean(data.pic_mode) ? 'success' : 'warn';
            return <State type={type}>{text}</State>;
        },
    },
    {
        key: 'create_time',
        label: '创建时间',
        children: (data: any) => {
            const datetimeStr = dateFormat(data.create_time);
            return (
                <div className="flex flex-col gap-2">
                    <span>{datetimeStr.split(' ')[0]}</span>
                    <span>{datetimeStr.split(' ')[1]}</span>
                </div>
            );
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

const searchDatas = [
    { name: 'experiment_name', type: 'input', placeholder: '请输入实验名称' },
    { name: 'engine_name', type: 'input', placeholder: '请输入引擎名称' },
];
