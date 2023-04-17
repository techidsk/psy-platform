import { Metadata } from "next"
import Link from 'next/link'
import { Icons } from "@/components/icons"
import { UserAuthForm } from "@/components/user-auth-form"

import './register.css'
export const metadata: Metadata = {
    title: "登录",
    description: "登录平台",
}

export default function RegisterPage() {
    return (
        <div className="container grid h-screen w-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0 bg-white">
            <Link
                href="/login"
                className={"absolute top-4 right-4 md:top-8 md:right-8"}
            >
                登录
            </Link>
            <div className="hidden h-full bg-slate-100 lg:block" />
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <Icons.logo className="mx-auto h-6 w-6" />
                        <h1 className="text-2xl font-semibold tracking-tight">
                            创建账号
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            输入你的Email以注册账号
                        </p>
                    </div>
                    <UserAuthForm />
                    <p className="px-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        By clicking continue, you agree to our{" "}
                        <Link
                            href="/terms"
                            className="hover:text-brand underline underline-offset-4"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="hover:text-brand underline underline-offset-4"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    )
}
