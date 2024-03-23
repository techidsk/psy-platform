import { getCurrentUser } from '@/lib/session';
import { getUser } from '@/lib/logic/user';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Icons } from '@/components/icons';
import { getAvatarUrl } from '@/lib/logic/avatar';
import { UserSetttingAvatar } from '@/components/setting/setting-page-avatar';

import './setting.css';

/**用户设置界面 */
export default async function Settings() {
    const user = await getCurrentUser();

    if (!user) {
        return notFound();
    }

    const dbUser = await getUser(user.id);
    const resultUrl = getAvatarUrl(dbUser.avatar || '', dbUser.username || '');

    return (
        <div className="ml-6 max-w-3xl">
            <div className="flex flex-col gap-6 items-start min-w-[400px]">
                <div className="flex gap-4 justify-center items-center">
                    <div className="inline-block" data-id="avatar-container" style={{ height: 96 }}>
                        <UserSetttingAvatar user={dbUser}></UserSetttingAvatar>
                    </div>
                    <div>{dbUser?.username}</div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex gap-6">
                        <label className="text-gray-500 min-w-[144px]">注册日期</label>
                        <span className="text-gray-800">
                            {format(dbUser?.create_time || new Date(), 'y-MM-dd')}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex gap-6 items-center">
                        <label className="text-gray-500 min-w-[144px]">Qualtrics账号</label>
                        {dbUser?.qualtrics ? (
                            <div className="text-gray-800">{dbUser?.qualtrics}</div>
                        ) : (
                            <div className="flex gap-2 items-center">
                                <div className="text-gray-800">未绑定 Qualtrics 账号</div>
                                <button className="btn btn-link btn-sm">
                                    <Icons.link />
                                    去绑定
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-6 items-center">
                        <label className="text-gray-500 min-w-[144px]">电子邮件</label>
                        {dbUser?.email ? (
                            <div className="text-gray-800">{dbUser?.email}</div>
                        ) : (
                            <div className="flex gap-2 items-center">
                                <div className="text-gray-800">未绑定电子邮件</div>
                                <button className="btn btn-link btn-sm">
                                    <Icons.link />
                                    去绑定
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-6 items-center">
                        <label className="text-gray-500 min-w-[144px]">手机号码</label>
                        {dbUser?.tel ? (
                            <div className="text-gray-800">{dbUser?.tel}</div>
                        ) : (
                            <div className="flex gap-2 items-center">
                                <div className="text-gray-800">未绑定手机号码</div>
                                <button className="btn btn-link btn-sm">
                                    <Icons.link />
                                    去绑定
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
