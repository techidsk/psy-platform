"use client"
import Header from '@/components/header'
import Image from 'next/image';
import Link from 'next/link';
import './styles.css'
import { useState } from 'react';
import { PlayIcon, TrashIcon, PaperPlaneIcon } from '@radix-ui/react-icons'

/**实验管理员管理实验 */
export default function ExperimentList() {

    async function create(){

    }

    


    return (
        <div className='h-screen bg-white'>
            <Header />
            <div className='container mx-auto px-8 py-8'>
                <div className='flex flex-col gap-4'>
                    <div className='text-lg font-bold'>
                        用户列表
                    </div>
                    <table className='min-w-full divide-y divide-gray-200'>
                        <thead>
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
                                >
                                    用户名
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    创建时间
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Email
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    状态
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    资讯
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                Array.of(1, 2, 3, 4).map(e => {
                                    return <tr key={e}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <div className='flex gap-4 items-center '>
                                                <Image
                                                    src='https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar-2.jpg'
                                                    alt=''
                                                    height={48}
                                                    width={48}
                                                    className='rounded-full'
                                                />
                                                <div className='flex flex-col gap-2'>
                                                    <span>
                                                        千年的婷婷
                                                    </span>
                                                    <span>
                                                        @techidsk
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                            <div className='flex flex-col gap-2 '>
                                                <span>
                                                    2021年12月8日
                                                </span>
                                                <span>
                                                    16点52分
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ecpknymt@gmail.com
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded bg-red-100 text-red-800">
                                                Inactive
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            我左手拿枪，右手开天，问天下谁是对手。
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className='flex gap-4 items-center '>
                                                <PlayIcon height={24} width={24} />
                                                <TrashIcon height={24} width={24} />
                                                <PaperPlaneIcon height={20} width={20} />
                                            </div>
                                        </td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
