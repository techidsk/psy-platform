import { Metadata } from "next"
import Link from "next/link"

import { Icons } from "@/components/icons"
import { UserAuthForm } from "@/components/user-auth-form"

export const metadata: Metadata = {
    title: "登录",
    description: "登录平台",
}

export default function LoginPage() {
    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center lg:max-w-none bg-white">
            <Link
                href="/"
                className={"absolute top-4 left-4 md:top-8 md:left-8"}
            >
                <div className="flex items-center">
                    <Icons.chevronLeft className="mr-2 h-4 w-4" />
                    <span className="text-gray-700">返回</span>
                </div>
            </Link>
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <Icons.logo className="mx-auto h-6 w-6" />
                    <h1 className="text-2xl font-semibold tracking-tight">
                        欢迎回来
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        请输入账号密码
                    </p>
                </div>
                <UserAuthForm />
                <p className="px-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    <Link
                        href="/register"
                        className="hover:text-brand underline underline-offset-4"
                    >
                        还没有账号？点击注册
                    </Link>
                </p>
            </div>
        </div>
    )
}
