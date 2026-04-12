'use client';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { getAvatarUrl } from '@/lib/logic/avatar';
import { type HeaderUserInfo } from '@/lib/logic/user';
import { Avatar } from '@/components/ui/avatar';

interface HeaderProps {
    user: HeaderUserInfo;
}

export default function Header({ user }: HeaderProps) {
    function logout() {
        // 使用当前页面的 origin 构建完整的回调 URL，避免端口不一致问题
        const callbackUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : '/';
        signOut({
            callbackUrl,
            redirect: true,
        });
    }

    const resultAvatarUrl = getAvatarUrl(user.avatar || '', user.username || '');

    return (
        <div className="w-full bg-base-100 shadow-sm">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
                <div className="flex flex-row justify-between py-2 md:py-2.5 lg:py-3">
                    <Link href="/dashboard">
                        <div className="flex gap-2 md:gap-3 items-center group">
                            <img
                                src="/logo-xs.png"
                                alt=""
                                className="h-7 w-7 md:h-8 md:w-8 lg:h-9 lg:w-9 transition-transform group-hover:scale-105"
                            />
                            <span className="text-xs md:text-sm font-semibold tracking-widest text-base-content/70 uppercase">
                                EL PSY
                            </span>
                        </div>
                    </Link>
                    <div className="flex gap-2 md:gap-3 items-center">
                        <span className="hidden md:inline text-xs md:text-sm text-base-content/60">
                            {user.username}
                        </span>
                        <Avatar src={resultAvatarUrl} size="sm" ring />
                        <button
                            className="btn btn-ghost btn-xs text-base-content/50 hover:text-base-content transition-colors"
                            onClick={logout}
                        >
                            登出
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
