'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { State } from '@/components/state';
import { EngineTableEditButtons } from '@/components/engine/engine-table-edit-buttons';

interface EngineRecord {
    id: number;
    engine_name: string;
    engine_image: string;
    engine_description: string;
    gpt_prompt: string;
    state: boolean;
    num: number;
}

const columns: ColumnDef<EngineRecord, any>[] = [
    {
        accessorKey: 'engine_image',
        header: () => '引擎',
        cell: ({ row }) => (
            <div className="flex flex-row gap-2 items-center">
                <img
                    className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-sm object-cover"
                    src={row.original.engine_image}
                    alt={row.original.engine_name}
                />
                <span>{row.original.engine_name}</span>
            </div>
        ),
    },
    {
        accessorKey: 'state',
        header: () => '状态',
        cell: ({ row }) => {
            const text = row.original.state ? '可用' : '暂停';
            const type = row.original.state ? 'success' : 'error';
            return <State type={type}>{text}</State>;
        },
    },
    {
        accessorKey: 'gpt_prompt',
        header: () => '提示词',
        cell: ({ row }) => (
            <article className="whitespace-normal text-ellipsis line-clamp-4">
                {row.original.gpt_prompt}
            </article>
        ),
    },
    {
        id: 'actions',
        header: () => <span className="sr-only">操作</span>,
        cell: ({ row }) => (
            <div className="flex gap-4 items-center">
                <EngineTableEditButtons engineId={row.original.id} />
            </div>
        ),
    },
];

export function EngineDataTable({ data }: { data: EngineRecord[] }) {
    return <DataTable columns={columns} data={data} />;
}
