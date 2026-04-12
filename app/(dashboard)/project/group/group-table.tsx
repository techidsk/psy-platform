'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable, DataTableCheckbox } from '@/components/data-table';
import { State } from '@/components/state';
import { ProjectTableEditButtons } from '@/components/project/project-table-edit-buttons';

const PROJECT_GROUP_IDS_KEY = 'project-group-ids';

interface ProjectGroupRecord {
    id: number;
    group_name: string;
    description: string;
    state: string;
}

const columns: ColumnDef<any, any>[] = [
    {
        id: 'select',
        header: ({ table }) => <DataTableCheckbox table={table} />,
        cell: ({ row }) => <DataTableCheckbox row={row} />,
    },
    {
        accessorKey: 'group_name',
        header: () => '分组名称',
        cell: ({ row }) => <span>{row.original.group_name}</span>,
    },
    {
        accessorKey: 'description',
        header: () => '分组描述',
        cell: ({ row }) => <span>{row.original.description}</span>,
    },
    {
        accessorKey: 'state',
        header: () => '状态',
        cell: ({ row }) => {
            const text = row.original.state === 'AVAILABLE' ? '可用' : '未分配';
            const state = row.original.state === 'AVAILABLE' ? 'success' : 'warn';
            return (
                <div className="flex flex-col gap-2 items-start">
                    <State type={state}>{text}</State>
                </div>
            );
        },
    },
    {
        id: 'actions',
        header: () => <span className="sr-only">操作</span>,
        cell: ({ row }) => (
            <div className="flex gap-4 items-center">
                <ProjectTableEditButtons projectId={row.original.id} />
            </div>
        ),
    },
];

interface GroupDataTableProps {
    data: any[];
    pagination?: React.ReactNode;
}

export function GroupDataTable({ data, pagination }: GroupDataTableProps) {
    return (
        <DataTable
            columns={columns}
            data={data}
            selectionKey={PROJECT_GROUP_IDS_KEY}
            pagination={pagination}
        />
    );
}
