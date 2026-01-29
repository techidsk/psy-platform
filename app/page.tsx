import { getCurrentUser } from '@/lib/session';
import { Brain } from 'lucide-react';
import Link from 'next/link';
import { HomeLoginForm } from '@/components/home-login-form';

export default async function Home() {
    const currentUser = await getCurrentUser();

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
            {/* 左侧背景区域 */}
            <div className="login-left hidden md:flex md:w-1/2 lg:w-[55%] relative m-4 rounded-3xl overflow-hidden">
                {/* 顶部标签 */}
                <div className="absolute top-8 left-8 z-10 flex items-center gap-2">
                    <span className="text-white/80 text-sm tracking-widest uppercase">
                        探索内心
                    </span>
                    <span className="w-16 h-px bg-white/50" />
                </div>

                {/* 底部文案 */}
                <div className="absolute bottom-12 left-8 right-8 z-10 text-white">
                    <h2 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 italic">
                        用文字
                        <br />
                        触达心灵
                        <br />
                        深处
                    </h2>
                    <p className="text-white/70 text-sm max-w-xs leading-relaxed">
                        通过写作与AI的结合，开启一段独特的心理探索之旅，发现更真实的自己。
                    </p>
                </div>
            </div>

            {/* 右侧登录区域 */}
            <div className="flex-1 md:w-1/2 lg:w-[45%] bg-white flex flex-col min-h-screen md:min-h-0 md:my-4 md:mr-4 md:rounded-3xl">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 pt-8">
                    <Brain className="w-6 h-6 text-primary" />
                    <span className="font-semibold text-lg text-gray-800">Psy Platform</span>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
                    <div className="w-full max-w-sm">
                        <div className="text-center mb-8">
                            <h1 className="font-bold text-gray-900 text-3xl mb-3">欢迎回来</h1>
                            <p className="text-gray-500 text-sm">
                                {currentUser?.id ? '继续你的创作之旅' : '输入账号密码登录'}
                            </p>
                        </div>

                        {currentUser?.id ? (
                            <div className="flex flex-col gap-4">
                                <Link
                                    href="/dashboard"
                                    className="btn bg-gray-900 hover:bg-gray-800 text-white border-none w-full h-12 rounded-xl"
                                >
                                    进入控制台
                                </Link>
                            </div>
                        ) : (
                            <>
                                <HomeLoginForm />
                                <p className="text-center text-gray-400 text-sm mt-6">
                                    还没有账号？
                                    <Link
                                        href="/register"
                                        className="text-gray-900 font-medium hover:underline ml-1"
                                    >
                                        立即注册
                                    </Link>
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <footer className="py-6 text-center text-gray-400 text-xs">
                    <a
                        href="https://beian.miit.gov.cn/#/Integrated/index"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-600 transition-colors"
                    >
                        浙ICP备2024070404号-1
                    </a>
                </footer>
            </div>
        </div>
    );
}
