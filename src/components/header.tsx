'use client';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { getAvatarUrl } from '@/lib/logic/avatar';
import { type HeaderUserInfo } from '@/lib/logic/user';

interface HeaderProps {
    user: HeaderUserInfo;
}

export default function Header({ user }: HeaderProps) {
    function logout() {
        signOut({
            callbackUrl: '/login',
        });
    }

    const resultAvatarUrl = getAvatarUrl(user.avatar || '', user.username || '');

    return (
        <div className="w-full bg-white border-b border-slate-300">
            <div className="container mx-auto px-8">
                <div className="flex flex-row justify-between py-4">
                    <Link href="/dashboard">
                        <div className="flex gap-4 items-center">
                            <Image src="/logo-xs.png" alt="" height={45} width={45} />
                            <div>EL PSY</div>
                        </div>
                    </Link>
                    <div className="flex gap-4 items-center">
                        <div className="avatar">
                            <div className="rounded-full">
                                <Image
                                    //"https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar.avif"
                                    src={resultAvatarUrl}
                                    alt=""
                                    width={48}
                                    height={48}
                                    style={{ width: 48, height: 48 }}
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
