import { DashboardHeader } from '@/components/dashboard-header';
import { getCurrentUser } from '@/lib/session';
import { CreateUserButton } from '@/components/user/user-create-button';
import { UserList } from '@/components/user/user-list';
import { UserRole } from '@/types/user';

export default async function User() {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return null;
    }

    const role = currentUser.role as UserRole;
    if (role === 'USER') {
        return null;
    }

    return (
        <div className="container mx-auto">
            <div className="flex flex-col gap-4">
                <DashboardHeader heading="用户列表" text="管理相关用户">
                    <CreateUserButton className="btn btn-primary btn-sm" />
                </DashboardHeader>
                <div className="w-full overflow-auto">
                    <UserList role={role} />
                </div>
            </div>
        </div>
    );
}
