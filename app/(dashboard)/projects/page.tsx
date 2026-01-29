import { DashboardHeader } from '@/components/dashboard-header';
import { Table } from '@/components/table/table';
import { TableConfig } from '@/types/table';
import { State } from '@/components/state';
import Pagination from '@/components/pagination';
import { ProjectTableEditButtons } from '@/components/project/project-table-edit-buttons';
import { CreateProjectButton } from '@/components/project/project-create-button';
import { TableSearch } from '@/components/table/table-search';
import { ProjectInviteCodeButton } from '@/components/project/project-invite-code-buttons';
import GuestModeChecker from '@/components/platform/guest-mode-checker';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
    getProjects,
    ProjectSearchParams,
    ProjectState,
    FormattedProjectRecord,
} from '@/lib/queries/project';

dayjs.extend(customParseFormat);

export default async function Projects({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string }>;
}) {
    const params = await searchParams;
    const currentPage = params.page ? parseInt(params.page) || 1 : 1;
    const currentPageSize = params.pagesize ? parseInt(params.pagesize) || 10 : 10;
    const sortBy = params.sort_by || 'start_time';
    const sortOrder = (params.sort_order as 'asc' | 'desc') || 'desc';

    const projectParams: ProjectSearchParams = {
        ...params,
        sort_by: sortBy,
        sort_order: sortOrder,
    };

    const datas = await getProjects(projectParams, currentPage, currentPageSize);
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
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        searchNode={
                            <TableSearch defaultParams={params} searchDatas={searchDatas} />
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
        sortable: true,
        children: (data: FormattedProjectRecord) => {
            return <span>{data.project_name}</span>;
        },
    },
    {
        key: 'project_description',
        label: '项目描述',
        children: (data: FormattedProjectRecord) => {
            return <article className="text-wrap">{data.project_description}</article>;
        },
    },
    {
        key: 'private',
        label: '游客模式',
        children: (data: FormattedProjectRecord) => {
            return <GuestModeChecker data={data} />;
        },
    },
    {
        key: 'invite_code',
        label: '邀请码',
        children: (data: FormattedProjectRecord) => {
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
        sortable: true,
        children: (data: FormattedProjectRecord) => {
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
        sortable: true,
        children: (data: FormattedProjectRecord) => {
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
        children: (data: FormattedProjectRecord) => {
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
