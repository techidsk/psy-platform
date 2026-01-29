import { db } from '@/lib/db';
import { DashboardHeader } from '@/components/dashboard-header';
import { Table } from '@/components/table/table';
import { TableConfig } from '@/types/table';
import { State } from '@/components/state';
import { dateFormat } from '@/lib/date';
import { Icons } from '@/components/icons';

type UserGroupProps = {
    id: string;
    group_name: string;
    experiment_id: number;
    state: boolean;
};

async function getUserGroup() {
    const userGroups = await db.user_group.findMany();
    return userGroups;
}

export default async function UserGroup() {
    const datas = await getUserGroup();

    return (
        <div className="container mx-auto">
            <div className="flex flex-col gap-4">
                <DashboardHeader heading="用户组列表" text="管理相关用户组">
                    <button className="btn btn-primary btn-sm">
                        <Icons.add />
                        新增
                    </button>
                </DashboardHeader>
                <div className="w-full overflow-auto">
                    <Table configs={userGroupTableConfig} datas={datas} />
                </div>
            </div>
        </div>
    );
}

const userGroupTableConfig: TableConfig[] = [
    {
        key: 'group_name',
        label: '用户组名称',
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2 items-start">
                    <span>{data.group_name}</span>
                </div>
            );
        },
    },
    {
        key: 'state',
        label: '状态',
        children: (data: any) => {
            return (
                <div className="flex flex-col gap-2">
                    <span>{Boolean(data.state) ? '已激活' : '已禁用'}</span>
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
                    <button className="btn btn-ghost btn-sm">编辑</button>
                    <button className="btn btn-ghost btn-sm">删除</button>
                </div>
            );
        },
    },
];
