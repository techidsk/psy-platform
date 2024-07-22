import { Metadata } from 'next';
import Link from 'next/link';
import { Icons } from '@/components/icons';

import './register.css';
import { UserRegisterForm } from '@/components/user-register-form';
export const metadata: Metadata = {
    title: '注册账号',
    description: '注册账号-自由写作平台',
};

interface RegisterPageProps {
    searchParams: { [key: string]: string };
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
    const qualtricsId = searchParams['qualtricsId'] || '';

    return (
        <div className="container grid h-screen w-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0 bg-white">
            <Link href="/login" className={'absolute top-4 right-4 md:top-8 md:right-8'}>
                登录
            </Link>
            <div className="hidden h-full bg-slate-100 lg:block" />
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <Icons.logo className="mx-auto h-6 w-6" />
                        <h1 className="text-2xl font-semibold tracking-tight">创建账号</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            输入你的信息以注册账号
                        </p>
                    </div>
                    <UserRegisterForm qualtricsId={qualtricsId} />
                    <p className="px-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        点击继续即表示您同意我们的{' '}
                        <Link
                            href="/terms"
                            className="hover:text-brand underline underline-offset-4"
                        >
                            服务条款
                        </Link>{' '}
                        和{' '}
                        <Link
                            href="/privacy"
                            className="hover:text-brand underline underline-offset-4"
                        >
                            隐私政策
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
