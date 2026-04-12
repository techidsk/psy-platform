'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';

const columns: ColumnDef<any, any>[] = [
    {
        accessorKey: 'group_name',
        header: () => '用户组名称',
        cell: ({ row }) => (
            <div className="flex flex-col gap-2 items-start">
                <span>{row.original.group_name}</span>
            </div>
        ),
    },
    {
        accessorKey: 'state',
        header: () => '状态',
        cell: ({ row }) => (
            <div className="flex flex-col gap-2">
                <span>{row.original.state ? '已激活' : '已禁用'}</span>
            </div>
        ),
    },
    {
        id: 'actions',
        header: () => <span className="sr-only">操作</span>,
        cell: () => (
            <div className="flex gap-4 items-center">
                <button className="btn btn-ghost btn-sm">编辑</button>
                <button className="btn btn-ghost btn-sm">删除</button>
            </div>
        ),
    },
];

export function UserGroupDataTable({ data }: { data: any[] }) {
    return <DataTable columns={columns} data={data} />;
}
