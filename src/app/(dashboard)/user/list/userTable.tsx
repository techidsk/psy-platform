import { PlayIcon, TrashIcon, PaperPlaneIcon, PlusIcon } from '@radix-ui/react-icons'
import Image from 'next/image';
import { PrismaClient } from '@prisma/client';

import { Table } from '@/components/table';
import { dateFormat } from '@/lib/date';

const prisma = new PrismaClient()

async function getUsers() {
    const users = await prisma.psy_user.findMany()
    prisma.$disconnect()
    const formattedUsers = users.map((user) => ({
        ...user,
        create_time: dateFormat(user['create_time']),
    }));
    return formattedUsers
}

export default async function UserTable() {
    const users = await getUsers();

    return (
        <div className="overflow-x-auto" >
            <Table configs={userTableConfig} datas={users} />
        </div>
    );
}


const userTableConfig = [
    {
        key: 'username',
        label: '用户名',
        className: 'font-medium text-gray-900',
        children: (data: any) => {
            return <div className='flex gap-4 items-center ' >
                <Image
                    src='https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar-2.jpg'
                    alt=''
                    height={48}
                    width={48}
                    className='rounded-full'
                />
                <div className='flex flex-col gap-2' >
                    <span>
                        {data.username}
                    </span>
                    <span>
                        {`${data.email}`}
                    </span>
                </div>
            </div>
        },
    },
    {
        key: 'create_time',
        label: '创建时间',
        children: (data: any) => {
            return <div className='flex flex-col gap-2 ' >
                <span>
                    {data.create_time}
                </span>
            </div>
        },
    },
    {
        key: 'email',
        label: '邮箱',
        children: (data: any) => {
            return <div className='flex flex-col gap-2 ' >
                <span>
                    {data.email}
                </span>
            </div>
        },
    },
    {
        key: 'user_role',
        label: '用户身份',
        children: (data: any) => {
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded bg-red-100 text-red-800" >
                {data.user_role}
            </span>
        },
    },
    {
        key: 'id',
        label: '操作',
        hidden: true,
        children: (data: any) => {
            return <div className='flex gap-4 items-center ' >
                <PlayIcon height={24} width={24} />
                <TrashIcon height={24} width={24} />
                <PaperPlaneIcon height={20} width={20} />
            </div>
        },
    }
]