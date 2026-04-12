import { DashboardHeader } from '@/components/dashboard-header';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/lib/db';
import SubpageHeader from '@/components/subpage-header';
import { ExperimentTableConfirmButton } from '@/components/experiment/experiment-table-comfirm-button';
import Pagination from '@/components/pagination';
import { experiment as ExperimentTableProps } from '@/generated/prisma';
import { ProjectExperimentDataTable } from './experiment-table';

async function getExperiments(
    searchParams: { [key: string]: string | undefined },
    page: number = 1,
    pageSize: number = 10
) {
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
        return [];
    }

    const projectGroupId = searchParams.project_group_id;
    const experiments = await db.$queryRawUnsafe<ExperimentTableProps[]>(
        `SELECT * from experiment e
        WHERE creator = ?
        AND available = 1
        AND e.id NOT IN (
            SELECT experiment_id FROM project_group_experiments GROUP BY experiment_id
        )
        LIMIT ${Number(pageSize)} OFFSET ${Number((page - 1) * pageSize)}`,
        parseInt(currentUser?.id)
    );

    return experiments;
}

// 获取实验列表用于关联对应的项目
export default async function ProjectAddExperiment({
    searchParams: searchParamsPromise,
}: {
    searchParams: Promise<{ [key: string]: string }>;
}) {
    const searchParams = await searchParamsPromise;
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
                        itemName="project-group-add-experiment"
                        projectGroupId={searchParams.project_group_id}
                    />
                </DashboardHeader>
                <div className="w-full overflow-auto">
                    <ProjectExperimentDataTable
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
