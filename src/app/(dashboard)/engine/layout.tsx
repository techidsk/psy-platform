import Header from "@/components/header"

export const metadata = {
    title: '引擎管理',
    description: '管理图像引擎以及相关设置',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <>{children}</>
    )
}
