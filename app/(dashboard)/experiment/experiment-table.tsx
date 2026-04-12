'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { State } from '@/components/state';
import { ExperimentDetailButton } from '@/components/experiment/experiment-detail-button';
import { dateFormat } from '@/lib/date';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const columns: ColumnDef<any, any>[] = [
    {
        accessorKey: 'project_name',
        header: () => '所属项目',
        cell: ({ row }) => (
            <div className="flex flex-col gap-2">
                <span>{row.original.project_name}</span>
            </div>
        ),
    },
    {
        accessorKey: 'group_name',
        header: () => '所属分组',
        cell: ({ row }) => (
            <div className="flex flex-col gap-2">
                <span>{row.original.group_name}</span>
            </div>
        ),
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
        accessorKey: 'engines',
        header: () => '使用引擎',
        cell: ({ row }) => {
            const engines = row.original.engines;
            const maxVisible = 2;
            const visibleEngines = engines.slice(0, maxVisible);
            const hiddenEngines = engines.slice(maxVisible);

            return (
                <div className="flex flex-col gap-2">
                    {visibleEngines.map((engine: any) => (
                        <div key={engine.engine_id} className="flex gap-1 items-center">
                            <img
                                src={engine.engine_image}
                                alt={engine.engine_name}
                                width={24}
                                height={24}
                                className="rounded-full"
                            />
                            <span>{engine.engine_name}</span>
                        </div>
                    ))}
                    {hiddenEngines.length > 0 && (
                        <TooltipProvider delayDuration={200}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                        +{hiddenEngines.length} 更多...
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" align="start">
                                    <div className="flex flex-col gap-2">
                                        {hiddenEngines.map((engine: any) => (
                                            <div
                                                key={engine.engine_id}
                                                className="flex gap-1 items-center"
                                            >
                                                <img
                                                    src={engine.engine_image}
                                                    alt={engine.engine_name}
                                                    width={20}
                                                    height={20}
                                                    className="rounded-full"
                                                />
                                                <span>{engine.engine_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            );
        },
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
        cell: ({ row }) => {
            const datetimeStr = dateFormat(row.original.create_time);
            return (
                <div className="flex flex-col gap-2">
                    <span>{datetimeStr.split(' ')[0]}</span>
                    <span>{datetimeStr.split(' ')[1]}</span>
                </div>
            );
        },
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

interface ExperimentDataTableProps {
    data: any[];
    searchNode?: React.ReactNode;
    pagination?: React.ReactNode;
}

export function ExperimentDataTable({ data, searchNode, pagination }: ExperimentDataTableProps) {
    return (
        <DataTable columns={columns} data={data} searchNode={searchNode} pagination={pagination} />
    );
}
