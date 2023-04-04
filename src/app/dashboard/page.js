"use client"
import Header from '@/components/header'
import Image from 'next/image';
import Link from 'next/link';
import './styles.css'
import { useState } from 'react';
import { PlayIcon, TrashIcon, PaperPlaneIcon } from '@radix-ui/react-icons'

/**预实验指导语 */
export default function Dashboard() {

    const [tab, setTab] = useState('homepage')

    const tabs = [
        { name: '首页', key: 'homepage' },
        { name: '测试记录', key: 'history' },
        { name: '设置', key: 'setting' },
    ]

    return (
        <div className='h-screen bg-white'>
            <Header />
            <div className='container mx-auto px-8 py-8'>
                <div className='flex gap-2 border-b-2 border-solid border-slate-300 mb-8'>
                    {
                        tabs.map(e => {
                            return <div className={`tab-item ${tab === e.key && 'active'}`} key={e.key} onClick={() => setTab(e.key)}>
                                {e.name}
                            </div>
                        })
                    }
                </div>
                {
                    tab === 'history' &&
                    <div className='flex flex-col gap-4'>
                        <div className='text-lg font-bold'>
                            测验历史
                        </div>
                        <div className='lists'>
                            {
                                Array.of(1, 2, 3, 4).map(e => {
                                    return <div className='lists-item' key={e}>
                                        <div className='flex gap-8 text-sm items-center'>
                                            <div className='flex flex-col gap-2 text-gray-600'>
                                                <span>
                                                    2021年12月8日
                                                </span>
                                                <span>
                                                    16点52分
                                                </span>
                                            </div>
                                            <div>
                                                我左手拿枪，右手开天，问天下谁是对手。
                                            </div>
                                        </div>
                                        <div className='flex gap-4 items-center'>
                                            <PlayIcon height={24} width={24} />
                                            <TrashIcon height={24} width={24} />
                                            <PaperPlaneIcon height={20} width={20} />
                                        </div>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                }
                {
                    tab === 'setting' &&
                    <div className='mx-auto max-w-3xl'>
                        <div className='flex gap-6'>
                            <div className='flex flex-col gap-4 justify-center items-center'>
                                <Image
                                    src='https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar-2.jpg'
                                    alt=''
                                    height={96}
                                    width={96}
                                    className='rounded-full'
                                />
                                <div>
                                    techidsk
                                </div>
                            </div>
                            <div className='flex flex-col gap-4 border-l border-solid border-gray-200 pl-6'>
                                <div>
                                    <label>用户名</label>
                                    <span>techidsk</span>
                                </div>
                                <div>
                                    <label>用户名</label>
                                    <span>techidsk</span>
                                </div>
                                <div>
                                    <label>用户名</label>
                                    <span>techidsk</span>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}
