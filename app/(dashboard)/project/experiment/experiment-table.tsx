'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable, DataTableCheckbox } from '@/components/data-table';
import { State } from '@/components/state';
import { ExperimentDetailButton } from '@/components/experiment/experiment-detail-button';
import { dateFormat } from '@/lib/date';

const PROJECT_GROUP_ADD_EXPERIMENT_KEY = 'project-group-add-experiment';

const columns: ColumnDef<any, any>[] = [
    {
        id: 'select',
        header: ({ table }) => <DataTableCheckbox table={table} />,
        cell: ({ row }) => <DataTableCheckbox row={row} />,
    },
    {
        accessorKey: 'experiment_name',
        header: () => '实验名称',
        cell: ({ row }) => (
            <div className="flex flex-col gap-2">
                <span>{row.original.experiment_name}</span>
            </div>
        ),
    },
    {
        accessorKey: 'lock',
        header: () => '锁定',
        cell: ({ row }) => {
            const text = row.original.lock ? '锁定' : '未锁定';
            const type = row.original.lock ? 'warn' : 'success';
            return <State type={type}>{text}</State>;
        },
    },
    {
        accessorKey: 'create_time',
        header: () => '创建时间',
        cell: ({ row }) => (
            <div className="flex flex-col gap-2">
                <span>{dateFormat(row.original.create_time)}</span>
            </div>
        ),
    },
    {
        id: 'actions',
        header: () => <span className="sr-only">操作</span>,
        cell: ({ row }) => (
            <div className="flex gap-4 items-center">
                <ExperimentDetailButton experiment={row.original} />
            </div>
        ),
    },
];

interface ProjectExperimentDataTableProps {
    data: any[];
    pagination?: React.ReactNode;
}

export function ProjectExperimentDataTable({ data, pagination }: ProjectExperimentDataTableProps) {
    return (
        <DataTable
            columns={columns}
            data={data}
            selectionKey={PROJECT_GROUP_ADD_EXPERIMENT_KEY}
            pagination={pagination}
        />
    );
}
