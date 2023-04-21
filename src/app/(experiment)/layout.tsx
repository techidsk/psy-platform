import { notFound } from "next/navigation"

import { getCurrentUser } from "@/lib/session"
import Header from "@/components/header"

interface DashboardLayoutProps {
    children?: React.ReactNode
}

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
            <div className="container grid gap-12 px-8">
                <main className="flex w-full flex-col overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}
