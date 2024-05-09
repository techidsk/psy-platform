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
import { cache } from 'react';

const getExperiments = cache(
    async (
        searchParams: { [key: string]: string | undefined },
        page: number = 1,
        pageSize: number = 10
    ) => {
        const currentUser = await getCurrentUser();
        if (!currentUser?.id) {
            return [];
        }
        const project_name = searchParams?.project_name || '';
        const project_group_name = searchParams?.project_group_name || '';
        const experiment_name = searchParams?.experiment_name || '';
        const engine_name = searchParams?.engine_name || '';

        const experiments = await db.$queryRaw<any[]>`
        SELECT 
            e.*, 
            MAX(p.project_name) AS project_name,
            MAX(pg.group_name) AS group_name,
            GROUP_CONCAT(DISTINCT CONCAT(en.engine_name, '_', en.engine_image, '_', en.id)) AS engines
        FROM 
            experiment e 
            LEFT JOIN engine en ON JSON_CONTAINS(e.engine_ids, CAST(en.id AS JSON), '$')
            LEFT JOIN project_group_experiments pge ON e.id = pge.experiment_id
            LEFT JOIN project_group pg ON pge.project_group_id = pg.id
            LEFT JOIN projects p ON pg.project_id = p.id
        WHERE 
            e.creator = ${currentUser.id}
            AND e.available = 1
            ${
                project_name
                    ? Prisma.sql`AND p.project_name LIKE '%${Prisma.raw(project_name)}%'`
                    : Prisma.empty
            }
            ${
                project_group_name
                    ? Prisma.sql`AND pg.group_name LIKE '%${Prisma.raw(project_group_name)}%'`
                    : Prisma.empty
            }
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
        GROUP BY 
            e.id
        ORDER BY 
            e.id DESC
        LIMIT 
            ${pageSize} OFFSET ${(page - 1) * pageSize}
    `;

        return experiments.map((experiment) => {
            const engineInfos = experiment.engines ? experiment.engines.split(',') : [];

            return {
                ...experiment,
                engines: engineInfos.map((engineInfo: string) => {
                    const [engine_name, engine_image, engine_id] = engineInfo.split('_');
                    return { engine_name, engine_image, engine_id };
                }),
            };
        });
    }
);

export const revalidate = 0;
export const dynamic = 'force-dynamic';

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
interface Engine {
    engine_name: string;
    engine_image: string;
    engine_id: number;
}

const experimentTableConfig: TableConfig[] = [
    {
        key: 'project_name',
        label: '所属项目',
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2">
                    <span>{data.project_name}</span>
                </div>
            );
        },
    },
    {
        key: 'group_name',
        label: '所属分组',
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2">
                    <span>{data.group_name}</span>
                </div>
            );
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
        key: 'engine_id',
        label: '使用引擎',
        children: (data: any) => {
            const engines = data.engines as Engine[];

            return (
                <div className="flex flex-col gap-2">
                    {engines.map((engine) => (
                        <div key={engine.engine_id} className="flex gap-1 items-center">
                            <Image
                                src={engine.engine_image}
                                alt={engine.engine_name}
                                width={24}
                                height={24}
                                className="rounded-full"
                            />
                            <span>{engine.engine_name}</span>
                        </div>
                    ))}
                </div>
            );
        },
    },
    {
        key: 'lock',
        label: '锁定',
        children: (data: any) => {
            let text = Boolean(data.lock) ? '锁定' : '未锁定';
            let type = Boolean(data.lock) ? 'warn' : 'success';
            return <State type={type}>{text}</State>;
        },
    },
    // {
    //     key: 'available',
    //     label: '状态',
    //     children: (data: any) => {
    //         let text = Boolean(data.available) ? '可用' : '暂停';
    //         let type = Boolean(data.available) ? 'success' : 'warn';
    //         return <State type={type}>{text}</State>;
    //     },
    // },
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
    { name: 'project_name', type: 'input', placeholder: '请输入项目名称' },
    { name: 'project_group_name', type: 'input', placeholder: '请输入项目分组名称' },
    { name: 'experiment_name', type: 'input', placeholder: '请输入实验名称' },
    { name: 'engine_name', type: 'input', placeholder: '请输入引擎名称' },
];
