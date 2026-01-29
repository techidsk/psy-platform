import { db } from '@/lib/db';
import { UserCreateForm } from '@/components/user/user-create-form';
import SubpageHeader, { SubpageContentHeader } from '@/components/subpage-header';
import { logger } from '@/lib/logger';

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
        logger.error(`未找到用户${nanoId}`);
        return null;
    }

    return user;
}

export default async function UserForm({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getUser(id);

    return (
        <div className="container lg:max-w-none bg-white">
            <SubpageHeader />
            <div className="flex flex-col gap-4">
                <SubpageContentHeader heading={`${user?.id ? '编辑用户' : '创建新用户'}`} />
                <UserCreateForm className="w-full px-2" nano_id={id} />
            </div>
        </div>
    );
}
