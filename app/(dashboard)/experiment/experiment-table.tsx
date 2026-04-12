'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { State } from '@/components/state';
import { ExperimentDetailButton } from '@/components/experiment/experiment-detail-button';
import { dateFormat } from '@/lib/date';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserRole } from '@/types/user';
import { filterColumnsByRole } from '@/lib/table-utils';

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
        accessorKey: 'intent_profile',
        header: () => '实验意图',
        meta: { auth: ['SUPERADMIN'] as UserRole[] },
        cell: ({ row }) => {
            const raw = row.original.intent_profile;
            if (!raw) return <span className="text-gray-400 text-xs">未分析</span>;
            try {
                const profile = JSON.parse(raw);
                return (
                    <TooltipProvider delayDuration={200}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="max-w-[200px] text-xs">
                                    <div className="truncate font-medium">{profile.purpose}</div>
                                    <div className="truncate text-gray-500">
                                        {profile.emotional_direction}
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" align="start" className="max-w-sm">
                                <div className="flex flex-col gap-1 text-xs">
                                    <div>
                                        <span className="font-medium">目的：</span>
                                        {profile.purpose}
                                    </div>
                                    <div>
                                        <span className="font-medium">情绪方向：</span>
                                        {profile.emotional_direction}
                                    </div>
                                    <div>
                                        <span className="font-medium">图片指导：</span>
                                        {profile.image_guidance}
                                    </div>
                                    <div>
                                        <span className="font-medium">关键词：</span>
                                        {profile.keywords?.join('、')}
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            } catch {
                return <span className="text-gray-400 text-xs">解析失败</span>;
            }
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
    role?: UserRole;
    searchNode?: React.ReactNode;
    pagination?: React.ReactNode;
}

export function ExperimentDataTable({
    data,
    role = 'USER',
    searchNode,
    pagination,
}: ExperimentDataTableProps) {
    const filteredColumns = filterColumnsByRole(columns, role);
    return (
        <DataTable
            columns={filteredColumns}
            data={data}
            searchNode={searchNode}
            pagination={pagination}
        />
    );
}
