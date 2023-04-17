import { notFound } from "next/navigation"

import { getCurrentUser } from "@/lib/session"
import Header from "@/components/header"
import { DashboardNav } from "@/components/sidebar"
import { SidebarNavItem } from '@/types'

export const metadata = {
    title: '控制台',
    description: '管理平台所有操作',
}


interface DashboardLayoutProps {
    children?: React.ReactNode
}
const sidebarNav: SidebarNavItem[] = [
    {
        title: "首页",
        href: "/dashboard",
        icon: "dashboard",
    },
    {
        title: "实验管理",
        href: "/experiment",
        icon: "billing",
    },
    {
        title: "引擎管理",
        href: "/engine",
        icon: "engine",
    },
    {
        title: "设置",
        href: "/settings",
        icon: "settings",
    },
]
export default async function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    const user = await getCurrentUser()

    if (!user) {
        return notFound()
    }

    return (
        <div className="mx-auto flex flex-col space-y-6 items-center bg-white">
            <header className="container sticky top-0 z-40 w-full bg-white">
                <Header user={user} />
            </header>
            <div className="container grid gap-12 md:grid-cols-[200px_1fr] px-8">
                <aside className="hidden w-[200px] flex-col md:flex">
                    <DashboardNav items={sidebarNav} />
                </aside>
                <main className="flex w-full flex-1 flex-col overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}
