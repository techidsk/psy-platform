import { db, QueryBuilder } from '@/lib/db';
import { DashboardHeader } from '@/components/dashboard-header';
import { getCurrentUser } from '@/lib/session';
import Pagination from '@/components/pagination';
import { Prisma } from '@/generated/prisma';
import { TableSearch } from '@/components/table/table-search';
import { CreateProjectGroupButton } from '@/components/project/group/project-group-create-button';
import { GroupsDataTable } from './groups-table';

type ProjectGroupState = 'AVAILABLE' | 'UNASSIGNED' | 'DISABLED';

type ProjectGroupTableProps = {
    id: string;
    group_name: string;
    description: string;
    state: ProjectGroupState;
    experiments: Prisma.JsonValue;
    project_name: string;
    user_num: number;
    experiment_num: number;
};

async function getProjectGroups(
    searchParams: { [key: string]: string | undefined },
    page: number = 1,
    pageSize: number = 10
) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return [];
    }
    const role = currentUser.role;
    if (role === 'USER') {
        return [];
    }
    const group_name = searchParams?.group_name || '';
    const project_name = searchParams?.project_name || '';
    const state = searchParams?.state || null;

    // 判断当前用户角色
    const qb = new QueryBuilder();
    qb.where('1 = 1');
    if (group_name) {
        qb.where('g.group_name LIKE ?', '%' + group_name + '%');
    }
    if (project_name) {
        qb.where('p.project_name LIKE ?', '%' + project_name + '%');
    }
    if (state) {
        qb.where('g.state LIKE ?', '%' + state + '%');
    }
    const { sql: whereSql, params } = qb.build();

    const projectGroups = await db.$queryRawUnsafe<ProjectGroupTableProps[]>(
        `SELECT g.*, p.project_name,
        COUNT(DISTINCT ug.user_id) AS user_num,
        COUNT(DISTINCT ge.id) AS experiment_num
        FROM project_group g
        LEFT JOIN projects p ON g.project_id = p.id
        LEFT JOIN user_group ug ON ug.project_group_id = g.id AND ug.project_id = p.id
        LEFT JOIN project_group_experiments ge ON ge.project_group_id = g.id
        WHERE ${whereSql}
        GROUP BY g.id, p.project_name
        LIMIT ${Number(pageSize)} OFFSET ${Number((page - 1) * pageSize)}`,
        ...params
    );

    return projectGroups;
}

export default async function ProjectGroups({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string }>;
}) {
    const params = await searchParams;
    const currentPage = params.page ? parseInt(params.page) || 1 : 1;
    const currentPageSize = params.pagesize ? parseInt(params.pagesize) || 10 : 10;
    const datas = await getProjectGroups(params, currentPage, currentPageSize);
    let end = currentPage;
    if (datas.length === currentPageSize) {
        end = currentPage + 1;
    }
    return (
        <div className="container mx-auto">
            <div className="flex flex-col gap-4">
                <DashboardHeader heading="项目分组列表" text="管理项目分组">
                    <CreateProjectGroupButton className="btn btn-primary btn-sm" />
                </DashboardHeader>
                <div className="w-full overflow-auto">
                    <GroupsDataTable
                        data={datas}
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
    { name: 'project_name', type: 'input', placeholder: '请输入所属项目名称' },
    { name: 'group_name', type: 'input', placeholder: '请输入项目分组名称' },
    {
        name: 'state',
        type: 'select',
        placeholder: '请选择分组状态',
        values: [
            { value: '', label: '' },
            { value: 'AVAILABLE', label: '可用' },
            { value: 'UNASSIGNED', label: '未分配' },
            { value: 'DISABLED', label: '停用' },
        ],
    },
];
