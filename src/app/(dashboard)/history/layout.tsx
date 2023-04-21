export const metadata = {
    title: '实验记录',
    description: '用户实验记录',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <>{children}</>
    )
}
