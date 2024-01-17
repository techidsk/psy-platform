import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Icons } from '@/components/icons';

async function getUser(userId: string) {
    const user = await db.user.findUnique({
        where: {
            id: parseInt(userId),
        },
        select: {
            username: true,
            email: true,
            tel: true,
            avatar: true,
            create_time: true,
            last_login_time: true,
            qualtrics: true,
        },
    });
    return user;
}

/**用户设置界面 */
export default async function Settings() {
    const user = await getCurrentUser();

    if (!user) {
        return notFound();
    }

    const dbUser = await getUser(user.id);

    return (
        <div className="ml-6 max-w-3xl">
            <div className="flex flex-col gap-6 items-start min-w-[400px]">
                <div className="flex gap-4 justify-center items-center">
                    <Image
                        src={
                            dbUser?.avatar ||
                            'https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar-2.jpg'
                        }
                        alt=""
                        height={96}
                        width={96}
                        className="rounded-full"
                    />
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
