import { db } from '@/lib/db';
import { DashboardHeader } from '@/components/dashboard-header';
import { Icons } from '@/components/icons';
import { UserGroupDataTable } from './usergroup-table';

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
                    <UserGroupDataTable data={datas} />
                </div>
            </div>
        </div>
    );
}
