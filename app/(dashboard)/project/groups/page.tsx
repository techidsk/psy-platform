import { db } from '@/lib/db';
import { DashboardHeader } from '@/components/dashboard-header';
import { Table } from '@/components/table/table';
import { TableConfig } from '@/types/table';
import { State } from '@/components/state';
import { getCurrentUser } from '@/lib/session';
import Pagination from '@/components/pagination';
import { JsonValue } from '@prisma/client/runtime/library';
import { TableSearch } from '@/components/table/table-search';
import { Prisma } from '@prisma/client';
import { CreateProjectGroupButton } from '@/components/project/group/project-group-create-button';
import { ProjectGroupTableEditButtons } from '@/components/project/group/project-group-table-edit-buttons';

type ProjectGroupState = 'AVAILABLE' | 'UNASSIGNED' | 'DISABLED';

type ProjectGroupTableProps = {
    id: string;
    group_name: string;
    description: string;
    state: ProjectGroupState;
    experiments: JsonValue;
    project_name: string;
    user_num: number;
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
    const projectGroups = await db.$queryRaw<ProjectGroupTableProps[]>`
        SELECT g.*, p.project_name, COUNT(ug.user_id) AS user_num
        FROM project_group g
        LEFT JOIN projects p ON g.project_id = p.id 
        LEFT JOIN user_group ug ON ug.project_group_id = g.id AND ug.project_id = p.id
        WHERE 1 = 1
        ${
            group_name
                ? Prisma.sql`AND g.group_name LIKE '%${Prisma.raw(group_name)}%'`
                : Prisma.empty
        }
        ${
            project_name
                ? Prisma.sql`AND p.project_name LIKE '%${Prisma.raw(project_name)}%'`
                : Prisma.empty
        }
        ${state ? Prisma.sql`AND g.state LIKE '%${Prisma.raw(state)}%'` : Prisma.empty}
        GROUP BY g.id
        LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
    `;

    return projectGroups;
}

export default async function ProjectGroups({
    searchParams,
}: {
    searchParams: { [key: string]: string };
}) {
    const currentPage = searchParams.page ? parseInt(searchParams.page) || 1 : 1;
    const currentPageSize = searchParams.pagesize ? parseInt(searchParams.pagesize) || 10 : 10;
    const datas = await getProjectGroups(searchParams, currentPage, currentPageSize);
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
                    <Table
                        configs={projectTableConfig}
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

const projectTableConfig: TableConfig[] = [
    {
        key: 'project_name',
        label: '所属项目',
        children: (data: any) => {
            return data.project_name ? (
                <div className="badge"> {data.project_name}</div>
            ) : (
                <div className="badge badge-error badge-outline">暂未分配</div>
            );
        },
    },
    {
        key: 'group_name',
        label: '分组名称',
        children: (data: any) => {
            return <span>{data.group_name}</span>;
        },
    },
    {
        key: 'description',
        label: '分组描述',
        children: (data: any) => {
            return <span>{data.description}</span>;
        },
    },
    {
        key: 'user_num',
        label: '分组人数',
        children: (data: any) => {
            return (
                <div className="flex gap-2">
                    <span>{`${data.user_num}`}</span>
                </div>
            );
        },
    },
    {
        key: 'gap',
        label: '实验间隔',
        children: (data: any) => {
            const hours = data.gap;
            const days = Math.floor(hours / 24);
            const hoursLeft = hours % 24;

            return (
                <div className="flex gap-2">
                    {days > 0 && <span>{`${days} 天`}</span>}
                    <span>{`${hoursLeft} 小时`}</span>
                </div>
            );
        },
    },
    {
        key: 'state',
        label: '状态',
        children: (data: ProjectGroupTableProps) => {
            const projectState: Record<ProjectGroupState, { text: string; state: string }> = {
                AVAILABLE: {
                    text: '可用',
                    state: 'success',
                },
                UNASSIGNED: {
                    text: '未分配',
                    state: 'error',
                },
                DISABLED: {
                    text: '停用',
                    state: 'error',
                },
            };

            let obj = projectState[data.state];

            return (
                <div className="flex flex-col gap-2 items-start">
                    <State type={obj.state}>{obj.text}</State>
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
                    <ProjectGroupTableEditButtons groupId={data.id} />
                </div>
            );
        },
    },
];

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
