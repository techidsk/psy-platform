"use client"
import * as Avatar from '@radix-ui/react-avatar';
import Link from 'next/link';
import Image from 'next/image'
import { signOut } from "next-auth/react"


export default function Header({ user }) {

    return (
        <div className='w-full bg-white border-b border-slate-300'>
            <div className='container mx-auto px-8'>
                <div className="flex flex-row justify-between py-4">
                    <Link href='./'>
                        <div className='flex gap-4 items-center'>
                            <Image src='/logo-xs.png' alt='' height={45} width={45} />
                            <div>
                                EL PSY
                            </div>
                        </div>
                    </Link>
                    <div>
                        <Avatar.Root className="AvatarRoot">
                            <Avatar.Image
                                className="AvatarImage"
                                src="https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar.avif"
                                alt={user?.name}
                            />
                            <Avatar.Fallback className="AvatarFallback">PD</Avatar.Fallback>
                        </Avatar.Root>
                        <button className='btn btn-link' onClick={() => signOut({
                            callbackUrl: '/login'
                        })}>登出</button>
                    </div>
                </div>
            </div>
        </div >
    )
}
