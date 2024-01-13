import { db } from '@/lib/db';
import { DashboardHeader } from '@/components/dashboard-header';
import { Table } from '@/components/table';
import { TableConfig } from '@/types/table';
import { State } from '@/components/state';
import { getCurrentUser } from '@/lib/session';
import { dateFormat } from '@/lib/date';
import Pagination from '@/components/pagination';
import { UserTableSearch } from '@/components/user/user-table-search';
import { ProjectTableEditButtons } from '@/components/project/project-table-edit-buttons';
import { CreateProjectButton } from '@/components/project/project-create-button';

type ProjectState = 'AVAILABLE' | 'DRAFT' | 'ACHIVED';
type ProjectTableProps = {
    id: string;
    project_name: string;
    project_description: string;
    engines: JSON;
    state: ProjectState;
    settings: JSON;
    start_time: Date;
    end_time: Date;
};

async function getProjects(
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

    // 判断当前用户角色
    const projects = await db.$queryRaw<ProjectTableProps[]>`
        select * from projects
        LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
    `;

    return projects.map((project) => {
        return {
            ...project,
            start_time: dateFormat(project.start_time).substring(0, 11),
            end_time: dateFormat(project.end_time).substring(0, 11),
        };
    });
}

export default async function Projects({
    searchParams,
}: {
    searchParams: { [key: string]: string };
}) {
    const currentPage = searchParams.page ? parseInt(searchParams.page) || 1 : 1;
    const currentPageSize = searchParams.pagesize ? parseInt(searchParams.pagesize) || 10 : 10;
    const datas = await getProjects(searchParams, currentPage, currentPageSize);
    let end = currentPage;
    if (datas.length === currentPageSize) {
        end = currentPage + 1;
    }

    return (
        <div className="container mx-auto">
            <div className="flex flex-col gap-4">
                <DashboardHeader heading="项目列表" text="管理测试项目">
                    <div className="flex gap-2">
                        <CreateProjectButton className="btn btn-primary btn-sm" />
                    </div>
                </DashboardHeader>
                <div className="w-full overflow-auto">
                    <Table
                        configs={projectTableConfig}
                        datas={datas}
                        headerChildren={<UserTableSearch defaultParams={searchParams} />}
                    >
                        <Pagination
                            path="./users"
                            current={currentPage}
                            pageSize={currentPageSize}
                            end={end}
                        />
                    </Table>
                </div>
            </div>
        </div>
    );
}

const projectTableConfig: TableConfig[] = [
    {
        key: 'project_name',
        label: '项目名称',
        children: (data: any) => {
            return <span>{data.project_name}</span>;
        },
    },
    {
        key: 'project_description',
        label: '项目描述',
        children: (data: any) => {
            return <span>{data.project_description}</span>;
        },
    },
    {
        key: 'state',
        label: '状态',
        children: (data: ProjectTableProps) => {
            const projectState: Record<ProjectState, { text: string; state: string }> = {
                AVAILABLE: {
                    text: '可用',
                    state: 'success',
                },
                DRAFT: {
                    text: '草稿',
                    state: 'pending',
                },
                ACHIVED: {
                    text: '已归档',
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
        key: 'start_time',
        label: '项目时间',
        hidden: true,
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2 items-start">
                    <span className="text-xs">开始时间: {data.start_time}</span>
                    <span className="text-xs">结束时间: {data.end_time}</span>
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
                    <ProjectTableEditButtons projectId={data.id} />
                </div>
            );
        },
    },
];
