import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';

import { getUser } from '@/lib/logic/user';
import { getCurrentUser } from '@/lib/session';
import Header from '@/components/header';
import { DashboardNav } from '@/components/sidebar';
import { SidebarNavItem } from '@/types';
import { UserRole } from '@/types/user';

import Loading from './loading';

export const metadata = {
    title: '控制台',
    description: '管理平台所有操作',
};

interface DashboardLayoutProps {
    children?: React.ReactNode;
}
const sidebarNav: SidebarNavItem[] = [
    {
        title: '首页',
        href: '/dashboard',
        icon: 'dashboard',
    },
    {
        title: '项目列表',
        href: '/projects',
        icon: 'projects',
        auth: ['ADMIN', 'ASSISTANT'],
        category: '项目',
    },
    {
        title: '项目分组列表',
        href: '/project/groups',
        icon: 'projectGroups',
        auth: ['ADMIN', 'ASSISTANT'],
    },
    {
        title: '实验管理',
        href: '/experiment',
        icon: 'billing',
        auth: ['ADMIN', 'ASSISTANT'],
        category: '实验',
    },
    {
        title: '用户实验',
        href: '/history',
        icon: 'history',
        auth: ['ADMIN', 'ASSISTANT'],
    },
    {
        title: '用户列表',
        href: '/users',
        icon: 'users',
        auth: ['ADMIN', 'ASSISTANT'],
        category: '用户',
    },
    // {
    //     title: '用户设置',
    //     href: '/settings',
    //     icon: 'settings',
    //     auth: ['ADMIN', 'ASSISTANT', 'USER'],
    // },
    // {
    //     title: '用户组',
    //     href: '/usergroup',
    //     icon: 'usergroup',
    //     auth: ['ADMIN', 'ASSISTANT'],
    // },
    // {
    //     title: '平台设置',
    //     href: '/platform/settings',
    //     icon: 'wrench',
    //     auth: ['ADMIN', 'ASSISTANT'],
    //     category: '其他',
    // },
    {
        title: '引擎管理',
        href: '/engine',
        icon: 'engine',
        auth: ['ADMIN', 'ASSISTANT'],
        category: '引擎',
    },
];

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/');
    }
    const dbUser = await getUser(user.id);

    const authedSidebar =
        user.role !== 'SUPERADMIN' ? authSidebar(sidebarNav, user.role as UserRole) : sidebarNav;

    return (
        <div className="mx-auto flex flex-col space-y-4 items-center bg-white">
            <header className="container sticky top-0 w-full bg-white">
                <Header user={dbUser} />
            </header>
            <div className="container grid gap-12 md:grid-cols-[200px_1fr]">
                <aside className="hidden w-[200px] flex-col md:flex">
                    <DashboardNav items={authedSidebar} />
                </aside>
                <main className="flex w-full flex-1 flex-col overflow-hidden">
                    <Suspense fallback={<Loading />}>{children}</Suspense>
                </main>
            </div>
        </div>
    );
}

function authSidebar(sidebarNav: SidebarNavItem[], role: UserRole) {
    return sidebarNav.filter((item) => {
        if (item.auth) {
            return item.auth.includes(role);
        }
        return true;
    });
}
