import { getCurrentUser } from '@/lib/session';
import Link from 'next/link.js';

export default async function Home() {
    const currentUser = await getCurrentUser();

    return (
        <div className="h-screen">
            <div className="login-left w-96 hidden md:block" />
            <div className="bg-white login-right ml-0 md:ml-96">
                <div className="h-full flex flex-col justify-between">
                    <div className="flex flex-1 flex-col gap-4 justify-center items-center">
                        <h1 className="font-bold text-gray-800 text-3xl mb-8">欢迎</h1>
                        {currentUser?.id ? (
                            <div className="flex flex-col gap-4 justify-center items-center">
                                <Link href={'/dashboard'} className="btn btn-primary w-[360px]">
                                    返回控制台
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 justify-center items-center">
                                <Link href={'/login'} className="btn btn-primary w-[360px]">
                                    登录
                                </Link>
                                <Link
                                    href={'/register'}
                                    className="btn btn-ghost btn-outline w-[360px]"
                                >
                                    注册
                                </Link>
                            </div>
                        )}
                    </div>
                    <footer className="flex-0">
                       <div className="flex justify-center my-4">
                            <p>
                                <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank" rel="noopener noreferrer">浙ICP备2024070404号-1</a>
                            </p>
                       </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
