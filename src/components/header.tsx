'use client';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';

interface HeaderProps {
    user: any;
}

export default function Header({ user }: HeaderProps) {
    function logout() {
        signOut({
            callbackUrl: '/login',
        });
    }

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
                                    src="https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar.avif"
                                    alt=""
                                    width={48}
                                    height={48}
                                    style={{ width: 48, height: 48 }}
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
