"use client"
import * as Avatar from '@radix-ui/react-avatar';
import Link from 'next/link';


export default function Header() {
    return (
        <div className='w-full bg-white border-b border-slate-300'>
            <div className='container mx-auto px-8'>
                <div className="flex flex-row justify-between py-4">
                    <Link href='./'>
                        <div className='flex gap-4 items-center'>
                            <img src='/logo-xs.png' alt='' style={{ height: 45 }} />
                            <div>
                                EL PSY
                            </div>
                        </div>
                    </Link>
                    <Avatar.Root className="AvatarRoot">
                        <Avatar.Image
                            className="AvatarImage"
                            src="https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar.avif"
                            alt="Colm Tuite"
                        />
                        <Avatar.Fallback className="AvatarFallback">PD</Avatar.Fallback>
                    </Avatar.Root>
                </div>
            </div>
        </div>
    )
}
