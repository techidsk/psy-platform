import { DashboardHeader } from '@/components/dashboard-header';
import Pagination from '@/components/pagination';
import { TableSearch } from '@/components/table/table-search';
import HistoryTableActionButtons from '@/components/history/history-table-action-buttons';
import { getExperimentHistory, HistorySearchParams } from '@/lib/queries/history';
import { getCurrentUser } from '@/lib/session';
import { UserRole } from '@/types/user';
import { HistoryDataTable } from './history-table';

/**实验管理 */
export default async function ExperimentHistory({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string }>;
}) {
    const params = await searchParams;
    const currentPage = params.page ? parseInt(params.page) || 1 : 1;
    const currentPageSize = params.pagesize ? parseInt(params.pagesize) || 10 : 10;
    const sortBy = params.sort_by || 'id';
    const sortOrder = (params.sort_order as 'asc' | 'desc') || 'desc';

    const historyParams: HistorySearchParams = {
        ...params,
        sort_by: sortBy,
        sort_order: sortOrder,
    };

    const datas = await getExperimentHistory(historyParams, currentPage, currentPageSize);
    const currentUser = await getCurrentUser();
    const role = (currentUser?.role as UserRole) || 'USER';

    let end = currentPage;
    if (datas.length === currentPageSize) {
        end = currentPage + 1;
    }
    return (
        <div className="container mx-auto h-[calc(100vh-theme(spacing.32))] flex flex-col">
            <div className="flex flex-col gap-4 h-full overflow-auto">
                <DashboardHeader heading="实验记录" text="查看用户实验记录"></DashboardHeader>
                <div className="w-full overflow-auto flex-1">
                    <HistoryDataTable
                        data={datas}
                        role={role}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        searchNode={
                            <TableSearch
                                defaultParams={params}
                                searchDatas={searchDatas}
                                actionNode={
                                    <HistoryTableActionButtons
                                        datas={datas}
                                        searchParams={params}
                                    />
                                }
                            />
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
    { name: 'username', type: 'input', placeholder: '请输入用户名' },
    { name: 'qualtrics', type: 'input', placeholder: '请输入用户Qualtrics' },
    { name: 'engine_name', type: 'input', placeholder: '请输入引擎名称' },
    { name: 'group_name', type: 'input', placeholder: '请输入分组名称' },
    { name: 'experiment_name', type: 'input', placeholder: '请输入实验名称' },
    { name: 'start_time', type: 'date', placeholder: '请选择开始时间' },
    { name: 'finish_time', type: 'date', placeholder: '请选择结束时间' },
];
