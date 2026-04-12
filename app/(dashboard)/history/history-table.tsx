'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable, DataTableColumnHeader, DataTableCheckbox } from '@/components/data-table';
import { formatTime } from '@/lib/date';
import DownloadExperimentHistoryButton from '@/components/history/download-experiment-history-button';
import CheckExperimentHistoryButton from '@/components/history/check-experiment-history-button';
import { HistoryExperimentDeleteButton } from '@/components/history/history-experiment-delete-button';
import { filterColumnsByRole } from '@/lib/table-utils';
import { UserRole } from '@/types/user';

const USER_EXPERIMENTS_HISTORY = 'user_experiments_history';

function getColumns(sortBy?: string, sortOrder?: 'asc' | 'desc'): ColumnDef<any, any>[] {
    return [
        {
            id: 'select',
            header: ({ table }) => <DataTableCheckbox table={table} />,
            cell: ({ row }) => <DataTableCheckbox row={row} />,
        },
        {
            accessorKey: 'experiment_name',
            header: () => (
                <DataTableColumnHeader
                    title="所属实验"
                    sortKey="experiment_name"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                />
            ),
            cell: ({ row }) => {
                const data = row.original;
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
            accessorKey: 'engine_id',
            header: () => (
                <DataTableColumnHeader
                    title="使用引擎"
                    sortKey="engine_name"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                />
            ),
            meta: { auth: ['ADMIN', 'ASSISTANT'] as UserRole[] },
            cell: ({ row }) => {
                const data = row.original;
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
            accessorKey: 'user_id',
            header: () => (
                <DataTableColumnHeader
                    title="实验对象"
                    sortKey="username"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                />
            ),
            meta: { auth: ['ADMIN', 'ASSISTANT'] as UserRole[] },
            cell: ({ row }) => {
                const data = row.original;
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
            accessorKey: 'group_name',
            header: () => (
                <DataTableColumnHeader
                    title="所属分组"
                    sortKey="group_name"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                />
            ),
            meta: { auth: ['ADMIN', 'ASSISTANT'] as UserRole[] },
            cell: ({ row }) => (
                <div className="flex flex-col gap-2">
                    <span>{row.original.group_name}</span>
                </div>
            ),
        },
        {
            accessorKey: 'start_time',
            header: () => (
                <DataTableColumnHeader
                    title="创建时间"
                    sortKey="start_time"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                />
            ),
            cell: ({ row }) => {
                const data = row.original;
                return (
                    <div className="flex flex-col gap-2">
                        <span>{data.start_time.split(' ')[0]}</span>
                        <span>{data.start_time.split(' ')[1]}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'finish_time',
            header: () => (
                <DataTableColumnHeader
                    title="完成时间"
                    sortKey="finish_time"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                />
            ),
            cell: ({ row }) => {
                const data = row.original;
                const d = Math.floor((data.finish_timestamp - data.start_timestamp) / 1000);
                return (
                    <div className="flex flex-col items-center gap-2">
                        {d > 0 ? <span>{formatTime(d)}</span> : '项目未完成'}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: () => <span className="sr-only">操作</span>,
            cell: ({ row }) => {
                const data = row.original;
                const d = Math.floor((data.finish_timestamp - data.start_timestamp) / 1000);
                return (
                    <div className="flex gap-2">
                        <CheckExperimentHistoryButton data={data} />
                        {d > 0 && <DownloadExperimentHistoryButton data={data} />}
                        <HistoryExperimentDeleteButton userExperimentId={data.id} />
                    </div>
                );
            },
        },
    ];
}

interface HistoryDataTableProps {
    data: any[];
    role: UserRole;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    searchNode?: React.ReactNode;
    pagination?: React.ReactNode;
}

export function HistoryDataTable({
    data,
    role,
    sortBy,
    sortOrder,
    searchNode,
    pagination,
}: HistoryDataTableProps) {
    const allColumns = getColumns(sortBy, sortOrder);
    const columns = filterColumnsByRole(allColumns, role);

    return (
        <DataTable
            columns={columns}
            data={data}
            selectionKey={USER_EXPERIMENTS_HISTORY}
            searchNode={searchNode}
            pagination={pagination}
        />
    );
}
