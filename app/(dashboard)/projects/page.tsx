import { DashboardHeader } from '@/components/dashboard-header';
import Pagination from '@/components/pagination';
import { CreateProjectButton } from '@/components/project/project-create-button';
import { TableSearch } from '@/components/table/table-search';
import { getProjects, ProjectSearchParams } from '@/lib/queries/project';
import { ProjectsDataTable } from './projects-table';

export default async function Projects({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string }>;
}) {
    const params = await searchParams;
    const currentPage = params.page ? parseInt(params.page) || 1 : 1;
    const currentPageSize = params.pagesize ? parseInt(params.pagesize) || 10 : 10;
    const sortBy = params.sort_by || 'start_time';
    const sortOrder = (params.sort_order as 'asc' | 'desc') || 'desc';

    const projectParams: ProjectSearchParams = {
        ...params,
        sort_by: sortBy,
        sort_order: sortOrder,
    };

    const datas = await getProjects(projectParams, currentPage, currentPageSize);
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
                    <ProjectsDataTable
                        data={datas}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
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
    {
        name: 'state',
        type: 'select',
        placeholder: '请选择项目状态',
        values: [
            { value: '', label: '' },
            { value: 'AVAILABLE', label: '可用' },
            { value: 'DRAFT', label: '未激活' },
            { value: 'ACHIVED', label: '已归档' },
            { value: 'EXPIRED', label: '已超时' },
        ],
    },
];
