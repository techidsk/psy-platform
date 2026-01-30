'use client';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { getAvatarUrl } from '@/lib/logic/avatar';
import { type HeaderUserInfo } from '@/lib/logic/user';

interface HeaderProps {
    user: HeaderUserInfo;
}

export default function Header({ user }: HeaderProps) {
    function logout() {
        // 使用当前页面的 origin 构建完整的回调 URL，避免端口不一致问题
        const callbackUrl =
            typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login';
        signOut({
            callbackUrl,
            redirect: true,
        });
    }

    const resultAvatarUrl = getAvatarUrl(user.avatar || '', user.username || '');

    return (
        <div className="w-full bg-white border-b border-slate-300">
            <div className="container mx-auto px-8">
                <div className="flex flex-row justify-between py-4">
                    <Link href="/dashboard">
                        <div className="flex gap-4 items-center">
                            <img src="/logo-xs.png" alt="" height={45} width={45} />
                            <div>EL PSY</div>
                        </div>
                    </Link>
                    <div className="flex gap-4 items-center">
                        <div className="avatar">
                            <div className="rounded-full w-12 h-12">
                                {/* 使用原生 img 标签，因为头像 URL 是动态 API 路由 */}
                                <img
                                    src={resultAvatarUrl}
                                    alt=""
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={logout}>
                            登出
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
