import { db } from '@/lib/db';
import { DashboardHeader } from '@/components/dashboard-header';
import { getCurrentUser } from '@/lib/session';
import Pagination from '@/components/pagination';
import { Prisma } from '@/generated/prisma';
import SubpageHeader from '@/components/subpage-header';
import { ProjectBindGroupButton } from '@/components/project/project-bind-group-button';
import { GroupDataTable } from './group-table';

type ProjectGroupTableProps = {
    id: string;
    group_name: string;
    description: string;
    state: string;
    experiments: Prisma.JsonValue;
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
    // 判断当前用户角色
    const projectGroups = await db.$queryRawUnsafe<ProjectGroupTableProps[]>(
        `SELECT * from project_group
        WHERE state = 'UNASSIGNED'
        LIMIT ${Number(pageSize)} OFFSET ${Number((page - 1) * pageSize)}`
    );

    return projectGroups;
}

export default async function ProjectGroup({
    searchParams: searchParamsPromise,
}: {
    searchParams: Promise<{ [key: string]: string }>;
}) {
    const searchParams = await searchParamsPromise;
    const currentPage = searchParams.page ? parseInt(searchParams.page) || 1 : 1;
    const currentPageSize = searchParams.pagesize ? parseInt(searchParams.pagesize) || 10 : 10;
    const datas = await getProjectGroups(searchParams, currentPage, currentPageSize);
    let end = currentPage;
    if (datas.length === currentPageSize) {
        end = currentPage + 1;
    }

    return (
        <div className="container mx-auto">
            <SubpageHeader />
            <div className="flex flex-col gap-4">
                <DashboardHeader heading="配置项目分组" text="管理配置项目分组">
                    <ProjectBindGroupButton className="btn btn-primary btn-sm" />
                </DashboardHeader>
                <div className="w-full overflow-auto">
                    <GroupDataTable
                        data={datas}
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
