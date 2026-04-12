'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTable, DataTableColumnHeader } from '@/components/data-table';
import { State } from '@/components/state';
import { ProjectTableEditButtons } from '@/components/project/project-table-edit-buttons';
import { ProjectInviteCodeButton } from '@/components/project/project-invite-code-buttons';
import GuestModeChecker from '@/components/platform/guest-mode-checker';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { FormattedProjectRecord, ProjectState } from '@/lib/queries/project';

dayjs.extend(customParseFormat);

function getColumns(
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
): ColumnDef<FormattedProjectRecord, any>[] {
    return [
        {
            accessorKey: 'project_name',
            header: () => (
                <DataTableColumnHeader
                    title="项目名称"
                    sortKey="project_name"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                />
            ),
            cell: ({ row }) => <span>{row.original.project_name}</span>,
        },
        {
            accessorKey: 'project_description',
            header: () => '项目描述',
            cell: ({ row }) => (
                <article className="text-wrap">{row.original.project_description}</article>
            ),
        },
        {
            accessorKey: 'private',
            header: () => '游客模式',
            cell: ({ row }) => <GuestModeChecker data={row.original} />,
        },
        {
            accessorKey: 'invite_code',
            header: () => '邀请码',
            cell: ({ row }) => {
                const data = row.original;
                let url = `/register?invite_code=${data.invite_code}`;
                if (data.private) {
                    url = `/guest/${data.invite_code}`;
                }
                return <ProjectInviteCodeButton data={data} url={url} />;
            },
        },
        {
            accessorKey: 'state',
            header: () => (
                <DataTableColumnHeader
                    title="状态"
                    sortKey="state"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                />
            ),
            cell: ({ row }) => {
                const data = row.original;
                const projectState: Record<ProjectState, { text: string; state: string }> = {
                    AVAILABLE: { text: '可用', state: 'success' },
                    DRAFT: { text: '未激活', state: 'pending' },
                    ACHIVED: { text: '已归档', state: 'error' },
                };

                let obj = projectState[data.state];
                if (dayjs(data.end_time, 'YYYY年MM月DD日', true).isBefore(dayjs(new Date()))) {
                    obj = { text: '已超时', state: 'error' };
                }

                return (
                    <div className="flex flex-col gap-2 items-start">
                        <State type={obj.state}>{obj.text}</State>
                    </div>
                );
            },
        },
        {
            accessorKey: 'start_time',
            header: () => (
                <DataTableColumnHeader
                    title="项目时间"
                    sortKey="start_time"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                />
            ),
            meta: { className: '' },
            cell: ({ row }) => {
                const data = row.original;
                return (
                    <div className="flex flex-col gap-2 items-start">
                        <span className="text-xs">开始时间: {data.start_time}</span>
                        <span className="text-xs">结束时间: {data.end_time}</span>
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
}

interface ProjectsDataTableProps {
    data: FormattedProjectRecord[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    searchNode?: React.ReactNode;
    pagination?: React.ReactNode;
}

export function ProjectsDataTable({
    data,
    sortBy,
    sortOrder,
    searchNode,
    pagination,
}: ProjectsDataTableProps) {
    const columns = getColumns(sortBy, sortOrder);
    return (
        <DataTable columns={columns} data={data} searchNode={searchNode} pagination={pagination} />
    );
}
