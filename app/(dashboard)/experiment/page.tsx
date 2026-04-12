import { DashboardHeader } from '@/components/dashboard-header';
import { getCurrentUser } from '@/lib/session';
import { db, QueryBuilder } from '@/lib/db';
import { ExperimentCreateButton } from '@/components/experiment/experiment-create-button';
import { TableSearch } from '@/components/table/table-search';
import Pagination from '@/components/pagination';
import { Prisma } from '@/generated/prisma';
import { cache } from 'react';
import { ExperimentDataTable } from './experiment-table';

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

        const qb = new QueryBuilder();
        qb.where('e.creator = ?', currentUser.id);
        qb.where('e.available = 1');
        if (project_name) {
            qb.where('p.project_name LIKE ?', '%' + project_name + '%');
        }
        if (project_group_name) {
            qb.where('pg.group_name LIKE ?', '%' + project_group_name + '%');
        }
        if (experiment_name) {
            qb.where('e.experiment_name LIKE ?', '%' + experiment_name + '%');
        }
        if (engine_name) {
            qb.where('en.engine_name LIKE ?', '%' + engine_name + '%');
        }
        const { sql: whereSql, params } = qb.build();

        const experiments = await db.$queryRawUnsafe<any[]>(
            `SELECT
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
            WHERE ${whereSql}
            GROUP BY
                e.id
            ORDER BY
                e.id DESC
            LIMIT ${Number(pageSize)} OFFSET ${Number((page - 1) * pageSize)}`,
            ...params
        );

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
    searchParams: Promise<{ [key: string]: string }>;
}) {
    const params = await searchParams;
    const currentPage = params.page ? parseInt(params.page) || 1 : 1;
    const currentPageSize = params.pagesize ? parseInt(params.pagesize) || 10 : 10;
    const currentUser = await getCurrentUser();
    const datas = await getExperiments(params, currentPage, currentPageSize);
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
                    <ExperimentDataTable
                        data={datas}
                        role={currentUser?.role as any}
                        searchNode={
                            <TableSearch defaultParams={params} searchDatas={searchDatas} />
                        }
                        pagination={
                            <Pagination
                                current={currentPage}
                                pageSize={currentPageSize}
                                end={end}
                            />
                        }
                    />
                </div>
            </div>
        </div>
    );
}
const searchDatas = [
    { name: 'project_name', type: 'input', placeholder: '请输入项目名称' },
    { name: 'project_group_name', type: 'input', placeholder: '请输入项目分组名称' },
    { name: 'experiment_name', type: 'input', placeholder: '请输入实验名称' },
    { name: 'engine_name', type: 'input', placeholder: '请输入引擎名称' },
];
