import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { DashboardHeader } from '@/components/dashboard-header';
import { CenteredHero } from '@/components/experiment/modules/centerd-hero';

export default async function Closed() {
    // 获取用户默认的实验
    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
        console.warn('未登录');
        redirect('/login');
    }

    const content = `已完成本次项目所有实验或者当前未开放实验`;

    return (
        <div className="container mx-auto">
            <div className="flex flex-col gap-4">
                <DashboardHeader heading="控制台" text="用户相关操作页面" />
                <div className="p-2">
                    <div className="hero">
                        <div className="hero-content text-center">
                            <div className="max-w-md">
                                <CenteredHero title={'已完成'} content={content} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
