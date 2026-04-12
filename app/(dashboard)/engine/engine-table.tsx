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
            <div className="flex flex-col gap-2">
                <img
                    className="rounded-sm"
                    src={row.original.engine_image}
                    alt={row.original.engine_name}
                    width={96}
                    height={96}
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
