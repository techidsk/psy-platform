import { db } from '@/lib/db';
import { DashboardHeader } from '@/components/dashboard-header';
import { Table } from '@/components/table/table';
import { TableConfig } from '@/types/table';
import { State } from '@/components/state';
import { getCurrentUser } from '@/lib/session';
import { dateFormat } from '@/lib/date';
import Pagination from '@/components/pagination';
import { ProjectTableEditButtons } from '@/components/project/project-table-edit-buttons';
import { CreateProjectButton } from '@/components/project/project-create-button';
import { TableSearch } from '@/components/table/table-search';
import { Prisma } from '@prisma/client';
import { ProjectInviteCodeButton } from '@/components/project/project-invite-code-buttons';
import GuestModeChecker from '@/components/platform/guest-mode-checker';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

type ProjectState = 'AVAILABLE' | 'DRAFT' | 'ACHIVED';
type ProjectTableProps = {
    id: string;
    project_name: string;
    project_description: string;
    engines: JSON;
    state: ProjectState;
    settings: JSON;
    start_time: Date;
    end_time: Date;
};

const getProjects = async (
    searchParams: { [key: string]: string | undefined },
    page: number = 1,
    pageSize: number = 10
) => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return [];
    }
    const role = currentUser.role;
    if (role === 'USER') {
        return [];
    }

    const project_name = searchParams?.project_name || '';
    const state = searchParams?.state || '';
    const currentDate = new Date().toISOString().split('T')[0]; // 获取当前日期，格式为YYYY-MM-DD

    // 判断当前用户角色
    const projects = await db.$queryRaw<ProjectTableProps[]>`
        SELECT * from projects p
        WHERE 1 = 1
        ${
            project_name
                ? Prisma.sql`AND p.project_name LIKE '%${Prisma.raw(project_name)}%'`
                : Prisma.empty
        }
        ${
            state === 'AVAILABLE'
                ? Prisma.sql`AND p.state = 'AVAILABLE' AND p.end_time >= ${currentDate}`
                : state === 'EXPIRED'
                  ? Prisma.sql`AND p.state = 'AVAILABLE' AND p.end_time < ${currentDate}`
                  : state
                    ? Prisma.sql`AND p.state = '${Prisma.raw(state)}'`
                    : Prisma.empty
        }

        LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
    `;

    return projects.map((project) => {
        return {
            ...project,
            start_time: dateFormat(project.start_time).substring(0, 11),
            end_time: dateFormat(project.end_time).substring(0, 11),
        };
    });
};

export default async function Projects({
    searchParams,
}: {
    searchParams: { [key: string]: string };
}) {
    const currentPage = searchParams.page ? parseInt(searchParams.page) || 1 : 1;
    const currentPageSize = searchParams.pagesize ? parseInt(searchParams.pagesize) || 10 : 10;
    const datas = await getProjects(searchParams, currentPage, currentPageSize);
    let end = currentPage;
    if (datas.length === currentPageSize) {
        end = currentPage + 1;
    }

    return (
        <div className="container mx-auto">
            <div className="flex flex-col gap-4">
                <DashboardHeader heading="项目列表" text="管理测试项目">
                    <div className="flex gap-2">
                        <CreateProjectButton className="btn btn-primary btn-sm" />
                    </div>
                </DashboardHeader>
                <div className="w-full overflow-auto">
                    <Table
                        configs={projectTableConfig}
                        datas={datas}
                        searchNode={
                            <TableSearch defaultParams={searchParams} searchDatas={searchDatas} />
                        }
                    >
                        <Pagination current={currentPage} pageSize={currentPageSize} end={end} />
                    </Table>
                </div>
            </div>
        </div>
    );
}

const projectTableConfig: TableConfig[] = [
    {
        key: 'project_name',
        label: '项目名称',
        children: (data: any) => {
            return <span>{data.project_name}</span>;
        },
    },
    {
        key: 'project_description',
        label: '项目描述',
        children: (data: any) => {
            return <article className="text-wrap">{data.project_description}</article>;
        },
    },
    {
        key: 'private',
        label: '游客模式',
        children: (data: any) => {
            return <GuestModeChecker data={data} />;
        },
    },
    {
        key: 'invite_code',
        label: '邀请码',
        children: (data: any) => {
            let url = `/register?invite_code=${data.invite_code}`;
            if (data.private) {
                url = `/guest/${data.invite_code}`;
            }
            return <ProjectInviteCodeButton data={data} url={url} />;
        },
    },
    {
        key: 'state',
        label: '状态',
        children: (data: ProjectTableProps) => {
            const projectState: Record<ProjectState, { text: string; state: string }> = {
                AVAILABLE: {
                    text: '可用',
                    state: 'success',
                },
                DRAFT: {
                    text: '未激活',
                    state: 'pending',
                },
                ACHIVED: {
                    text: '已归档',
                    state: 'error',
                },
            };

            let obj = projectState[data.state];
            // 判断是否已经超时
            // data.end_time 格式为2024年05月04日 格式统一后进行比较
            if (dayjs(data.end_time, 'YYYY年MM月DD日', true).isBefore(dayjs(new Date()))) {
                obj = {
                    text: '已超时',
                    state: 'error',
                };
            }

            return (
                <div className="flex flex-col gap-2 items-start">
                    <State type={obj.state}>{obj.text}</State>
                </div>
            );
        },
    },
    {
        key: 'start_time',
        label: '项目时间',
        hidden: true,
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2 items-start">
                    <span className="text-xs">开始时间: {data.start_time}</span>
                    <span className="text-xs">结束时间: {data.end_time}</span>
                </div>
            );
        },
    },
    {
        key: 'id',
        label: '操作',
        hidden: true,
        children: (data: any) => {
            return (
                <div className="flex gap-4 items-center">
                    <ProjectTableEditButtons projectId={data.id} />
                </div>
            );
        },
    },
];

const searchDatas = [
    { name: 'project_name', type: 'input', placeholder: '请输入项目名称' },
    {
        name: 'state',
        type: 'select',
        placeholder: '请选择项目状态',
        values: [
            { value: '', label: '' },
            { value: 'AVAILABLE', label: '可用' },
            { value: 'DRAFT', label: '未激活' },
            { value: 'ACHIVED', label: '已归档' },
            { value: 'EXPIRED', label: '已超时' },
        ],
    },
];
