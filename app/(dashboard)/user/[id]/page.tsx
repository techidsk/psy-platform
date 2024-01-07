import { UserCreateHeader } from '@/components/user/user-create-header';
import { Icons } from '@/components/icons';

import { db } from '@/lib/db';
import { UserCreateForm } from '@/components/user/user-create-form';

/**
 * 判断数据库中用户是否存在,如果存在则进入编辑流程.
 * @param nanoId
 */
async function getUser(nanoId: string) {
    const user = await db.user.findFirst({
        where: {
            nano_id: nanoId,
        },
    });

    if (!user) {
        console.log(`Experiment with nanoId: ${nanoId} not found.`);
        return null;
    }

    return user;
}

export default async function UserForm({ params: { id } }: any) {
    const user = await getUser(id);

    return (
        <div className="container h-screen lg:max-w-none bg-white">
            <div className="mb-4">
                <button className="btn btn-ghost">
                    <Icons.back />
                    返回
                </button>
            </div>
            <div className="flex flex-col gap-4">
                <UserCreateHeader heading={`${user?.id ? '编辑用户' : '创建新用户'}`} />
                <UserCreateForm className="w-full px-2" user={user} nano_id={id} />
            </div>
        </div>
    );
}
