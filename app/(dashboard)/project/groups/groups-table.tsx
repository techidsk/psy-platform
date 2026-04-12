'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { State } from '@/components/state';
import { ProjectGroupTableEditButtons } from '@/components/project/group/project-group-table-edit-buttons';

type ProjectGroupState = 'AVAILABLE' | 'UNASSIGNED' | 'DISABLED';

interface ProjectGroupRecord {
    id: string;
    group_name: string;
    description: string;
    state: ProjectGroupState;
    project_name: string;
    user_num: number;
    experiment_num: number;
    gap: number;
}

const columns: ColumnDef<any, any>[] = [
    {
        accessorKey: 'project_name',
        header: () => '所属项目',
        cell: ({ row }) =>
            row.original.project_name ? (
                <div>{row.original.project_name}</div>
            ) : (
                <div className="badge badge-error badge-outline">暂未分配</div>
            ),
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
        accessorKey: 'user_num',
        header: () => '分组人数',
        cell: ({ row }) => (
            <div className="flex gap-2">
                <span>{`${row.original.user_num}`}</span>
            </div>
        ),
    },
    {
        accessorKey: 'gap',
        header: () => '实验间隔',
        cell: ({ row }) => {
            const hours = row.original.gap;
            const days = Math.floor(hours / 24);
            const hoursLeft = hours % 24;
            return (
                <div className="flex gap-2">
                    {days > 0 && <span>{`${days} 天`}</span>}
                    <span>{`${hoursLeft} 小时`}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'state',
        header: () => '状态',
        cell: ({ row }) => {
            const data = row.original;
            if (data.experiment_num == 0) {
                return (
                    <div className="flex flex-col gap-2 items-start">
                        <State type="error">暂无实验</State>
                    </div>
                );
            }
            const projectState: Record<ProjectGroupState, { text: string; state: string }> = {
                AVAILABLE: { text: '分组正常', state: 'success' },
                UNASSIGNED: { text: '未分配项目', state: 'error' },
                DISABLED: { text: '已停用', state: 'error' },
            };
            const obj = projectState[data.state as ProjectGroupState];
            return (
                <div className="flex flex-col gap-2 items-start">
                    <State type={obj.state}>{obj.text}</State>
                </div>
            );
        },
    },
    {
        id: 'actions',
        header: () => <span className="sr-only">操作</span>,
        cell: ({ row }) => (
            <div className="flex gap-1 items-center">
                <ProjectGroupTableEditButtons groupId={row.original.id} />
            </div>
        ),
    },
];

interface GroupsDataTableProps {
    data: any[];
    searchNode?: React.ReactNode;
    pagination?: React.ReactNode;
}

export function GroupsDataTable({ data, searchNode, pagination }: GroupsDataTableProps) {
    return (
        <DataTable columns={columns} data={data} searchNode={searchNode} pagination={pagination} />
    );
}
