import './styles.css';
import { DashboardHeader } from '@/components/dashboard-header';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

// 获取用户在当前项目中的分组实验内容
// 1. 如果用户从未登陆，则查看是否当前项目，否则显示当前时间尚未开放实验
// 2. 如果有当前项目，但是没有分组，则查看是否有项目分组，如果没有则显示当前时间无可用分组
// 3. 如果有项目分组，随机选择分组，并则查看是否有对应实验，如果没有则显示当前时间无可用实验
// 4. 如果有对应实验，则返回实验内容

export default async function Dashboard() {
    // 获取用户默认的实验
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
        redirect('/login');
    }
    const needExperiment = currentUser.role === 'USER';

    // TODO 查看用户下次实验记录时间以及是否需要开始下次实验
    if (needExperiment) {
        redirect('/dashboard/home');
    }
    // TODO 查看用户下次实验记录时间以及是否需要开始下次实验
    // 1. 判断是否有实验项目
    // 2. 判断是否是否有未完成项目
    // 3. 判断是否未达到实验时间

    return (
        <>
            <div className="container mx-auto">
                <div className="flex flex-col gap-4">
                    <DashboardHeader heading="控制台" text="用户相关操作页面" />
                </div>
            </div>
        </>
    );
}
