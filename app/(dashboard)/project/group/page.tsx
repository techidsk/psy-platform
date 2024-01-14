import { db } from '@/lib/db';
import { DashboardHeader } from '@/components/dashboard-header';
import { Table } from '@/components/table/table';
import { TableConfig } from '@/types/table';
import { State } from '@/components/state';
import { getCurrentUser } from '@/lib/session';
import Pagination from '@/components/pagination';
import { ProjectTableEditButtons } from '@/components/project/project-table-edit-buttons';
import { CreateProjectButton } from '@/components/project/project-create-button';
import { JsonValue } from '@prisma/client/runtime/library';
import SubpageHeader from '@/components/subpage-header';
import TableCheckbox from '@/components/table/table-checkbox';

type ProjectGroupTableProps = {
    id: string;
    group_name: string;
    description: string;
    status: boolean;
    experiments: JsonValue;
};

const itemName = 'project-group-ids';
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
    // 判断当前用户角色
    const projectGroups = await db.$queryRaw<ProjectGroupTableProps[]>`
        select * from project_group
        LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
    `;

    return projectGroups;
}

export default async function ProjectGroup({
    searchParams,
}: {
    searchParams: { [key: string]: string };
}) {
    const currentPage = searchParams.page ? parseInt(searchParams.page) || 1 : 1;
    const currentPageSize = searchParams.pagesize ? parseInt(searchParams.pagesize) || 10 : 10;
    const datas = await getProjectGroups(searchParams, currentPage, currentPageSize);
    console.log(datas);
    let end = currentPage;
    if (datas.length === currentPageSize) {
        end = currentPage + 1;
    }

    return (
        <div className="container mx-auto">
            <SubpageHeader />
            <div className="flex flex-col gap-4">
                <DashboardHeader heading="配置项目分组" text="管理配置项目分组">
                    <CreateProjectButton className="btn btn-primary btn-sm" />
                </DashboardHeader>
                <div className="w-full overflow-auto">
                    <Table configs={projectTableConfig} datas={datas}>
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
        key: 'checkbox',
        label: '',
        children: (data: any) => {
            return <TableCheckbox data={data} itemName={itemName} />;
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
        key: 'state',
        label: '状态',
        children: (data: ProjectGroupTableProps) => {
            let obj = data.status
                ? {
                      text: '可用',
                      state: 'success',
                  }
                : {
                      text: '草稿',
                      state: 'pending',
                  };

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
                    <ProjectTableEditButtons projectId={data.id} />
                </div>
            );
        },
    },
];