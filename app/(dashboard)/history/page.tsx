import { DashboardHeader } from '@/components/dashboard-header';
import { Table } from '@/components/table/table';
import { TableConfig } from '@/types/table';

import { formatTime } from '@/lib/date';
import TableActions from '@/components/table/table-action';
import Pagination from '@/components/pagination';
import { TableSearch } from '@/components/table/table-search';
import DownloadExperimentHistoryButton from '@/components/history/download-experiment-history-button';
import CheckExperimentHistoryButton from '@/components/history/check-experiment-history-button';
import TableCheckbox from '@/components/table/table-checkbox';
import HistoryTableActionButtons from '@/components/history/history-table-action-buttons';
import { HistoryExperimentDeleteButton } from '@/components/history/history-experiment-delete-button';
import { getExperimentHistory, HistorySearchParams } from '@/lib/queries/history';

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
    let end = currentPage;
    if (datas.length === currentPageSize) {
        end = currentPage + 1;
    }
    return (
        <div className="container mx-auto h-[calc(100vh-theme(spacing.32))] flex flex-col">
            <div className="flex flex-col gap-4 h-full overflow-auto">
                <DashboardHeader heading="实验记录" text="查看用户实验记录"></DashboardHeader>
                <div className="w-full overflow-auto flex-1">
                    <Table
                        configs={experimentTableConfig}
                        datas={datas}
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
                    >
                        <Pagination current={currentPage} pageSize={currentPageSize} end={end} />
                    </Table>
                </div>
            </div>
        </div>
    );
}

const USER_EXPERIMENTS_HISTORY = 'user_experiments_history';

const experimentTableConfig: TableConfig[] = [
    {
        key: 'checkbox',
        label: '',
        checkbox_key: USER_EXPERIMENTS_HISTORY,
        children: (data: any) => {
            return <TableCheckbox data={data} itemName={USER_EXPERIMENTS_HISTORY} />;
        },
    },
    {
        key: 'experiment_name',
        label: '所属实验',
        sortable: true,
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2">
                    {data.part == 0 ? (
                        <span>{data.experiment_name}</span>
                    ) : (
                        <>
                            <span>{data.experiment_name}</span>
                            <span>{data.step_name}</span>
                        </>
                    )}
                </div>
            );
        },
    },
    {
        key: 'engine_id',
        label: '使用引擎',
        sortable: true,
        sortKey: 'engine_name',
        auth: ['ADMIN', 'ASSISTANT'],
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2 justify-center">
                    <img
                        className="rounded-sm"
                        src={data.engine_image}
                        alt={data.engine_name}
                        width={48}
                        height={48}
                    />
                    <div className="text-gray-700">{data.engine_name}</div>
                </div>
            );
        },
    },
    {
        key: 'user_id',
        label: '实验对象',
        sortable: true,
        sortKey: 'username',
        auth: ['ADMIN', 'ASSISTANT'],
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2 justify-center">
                    <div className="text-gray-700 text-sm">用户名：{data.username}</div>
                    {data.qualtrics && (
                        <div className="text-gray-700 text-sm">Qualtrics：{data.qualtrics}</div>
                    )}
                </div>
            );
        },
    },
    {
        key: 'group_name',
        label: '所属分组',
        sortable: true,
        auth: ['ADMIN', 'ASSISTANT'],
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2">
                    <span>{data.group_name}</span>
                </div>
            );
        },
    },
    {
        key: 'start_time',
        label: '创建时间',
        sortable: true,
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2">
                    <span>{data.start_time.split(' ')[0]}</span>
                    <span>{data.start_time.split(' ')[1]}</span>
                </div>
            );
        },
    },
    {
        key: 'finish_time',
        label: '完成时间',
        sortable: true,
        children: (data: any) => {
            let d = Math.floor((data.finish_timestamp - data.start_timestamp) / 1000);
            return (
                <div className="flex flex-col items-center gap-2">
                    {d > 0 ? <span>{formatTime(d)}</span> : '项目未完成'}
                </div>
            );
        },
    },
    {
        key: 'actions',
        label: '操作',
        hidden: true,
        children: (data: any) => {
            let d = Math.floor((data.finish_timestamp - data.start_timestamp) / 1000);

            return (
                <div className="flex gap-2">
                    <TableActions>
                        <CheckExperimentHistoryButton data={data} />
                        {d > 0 && <DownloadExperimentHistoryButton data={data} />}
                    </TableActions>
                    <HistoryExperimentDeleteButton userExperimentId={data.id} />
                </div>
            );
        },
    },
];

const searchDatas = [
    { name: 'username', type: 'input', placeholder: '请输入用户名' },
    { name: 'qualtrics', type: 'input', placeholder: '请输入用户Qualtrics' },
    { name: 'engine_name', type: 'input', placeholder: '请输入引擎名称' },
    { name: 'group_name', type: 'input', placeholder: '请输入分组名称' },
    { name: 'experiment_name', type: 'input', placeholder: '请输入实验名称' },
    { name: 'start_time', type: 'date', placeholder: '请选择开始时间' },
    { name: 'finish_time', type: 'date', placeholder: '请选择结束时间' },
];
