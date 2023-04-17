import Header from "@/components/header"

export const metadata = {
    title: '实验管理',
    description: '管理实验内容以及相关设置',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <>{children}</>
    )
}
