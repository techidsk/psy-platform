import Image from 'next/image';
import { db } from '@/lib/db';
import { DashboardHeader } from '@/components/dashboard-header';
import { Table } from '@/components/table';
import { TableConfig } from '@/types/table';
import { State } from '@/components/state';
import { getCurrentUser } from '@/lib/session'
import { dateFormat } from '@/lib/date';
import { CreateUserButton } from '@/components/user/user-create-button';
import { UserTableEditButtons } from '@/components/user/user-table-edit-buttons';
import Pagination from '@/components/pagination';
import { UserTableSearch } from '@/components/user/user-table-search';
import { Prisma } from '@prisma/client';

type UserRole = 'USER' | 'ADMIN' | 'ASSISTANT';
type UserTableProps = {
    id: string
    username: string
    email?: string
    tel?: string
    avatar: string
    user_role: UserRole
    create_time: Date
    last_login_time: Date
    user_group_id: number
    qualtrics?: string
    user_group_name: string
    user_engine_name: string
    engine_image: string
    manager_count: number
}

async function getUsers(searchParams: { [key: string]: string | undefined }, page: number = 1, pageSize: number = 10) {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
        return []
    }
    const role = currentUser.role
    if (role === 'USER') {
        return []
    }

    const username = searchParams?.username || ''
    const email = searchParams?.email || ''
    const tel = searchParams?.tel || ''
    const qualtrics = searchParams?.qualtrics || ''
    const group_name = searchParams?.group_name || ''
    const user_role = searchParams?.role || ''

    // 判断当前用户角色
    const users = await db.$queryRaw<UserTableProps[]>`
        select u.id, u.username, u.email, u.tel, u.avatar, u.user_role, u.create_time, u.qualtrics, u.last_login_time,
        g.group_name as user_group_name, e.engine_name as user_engine_name, e.engine_image, count(m.id) as manager_count
        from user u
        LEFT JOIN user m ON u.id = m.manager_id
        left join user_group g on g.id = u.user_group_id
        left join user_setting s on s.user_id = u.id
        left join engine e on e.id = s.engine_id
        where u.deleted = 0
        ${role !== 'ADMIN' ? Prisma.sql`AND u.manager_id = ${Prisma.raw(currentUser.id)}` : Prisma.empty}
        ${username ? Prisma.sql`AND u.username LIKE '%${Prisma.raw(username)}%'` : Prisma.empty}
        ${email ? Prisma.sql`AND u.email LIKE '%${Prisma.raw(email)}%'` : Prisma.empty}
        ${tel ? Prisma.sql`AND u.tel LIKE '%${Prisma.raw(tel)}%'` : Prisma.empty}
        ${qualtrics ? Prisma.sql`AND u.qualtrics LIKE '%${Prisma.raw(qualtrics)}%'` : Prisma.empty}
        ${group_name ? Prisma.sql`AND g.group_name LIKE '%${Prisma.raw(group_name)}%'` : Prisma.empty}
        ${user_role ? Prisma.sql`AND u.user_role = ${Prisma.raw(user_role)}` : Prisma.empty}
        GROUP BY u.id, u.manager_id
        LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
    `;

    return users.map(user => {
        return {
            ...user,
            avatar: 'https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar.avif',
            create_time: dateFormat(user.create_time),
            last_login_time: dateFormat(user.last_login_time),
        }
    })
}

export default async function User({ searchParams }: {
    searchParams: { [key: string]: string }
}) {
    console.log(searchParams)
    const currentPage = searchParams.page ? parseInt(searchParams.page) || 1 : 1
    const currentPageSize = searchParams.pagesize ? parseInt(searchParams.pagesize) || 10 : 10
    const datas = await getUsers(searchParams, currentPage, currentPageSize);

    let end = currentPage
    if (datas.length === currentPageSize) {
        end = currentPage + 1
    }


    return (
        <div className='container mx-auto'>
            <div className='flex flex-col gap-4'>
                <DashboardHeader heading="用户列表" text="管理相关用户">
                    <CreateUserButton className='btn btn-primary btn-sm' />
                </DashboardHeader>
                <div className='w-full overflow-auto'>
                    <Table
                        configs={userTableConfig}
                        datas={datas}
                        headerChildren={<UserTableSearch defaultParams={searchParams} />}
                    >
                        <Pagination path='./users' current={currentPage} pageSize={currentPageSize} end={end} />
                    </Table>
                </div>
            </div>
        </div>
    );
}


const userTableConfig: TableConfig[] = [
    {
        key: 'username',
        label: '用户名',
        children: (data: any) => {
            return <div className='flex flex-col gap-2 items-center'>
                <div className="avatar">
                    <div className="rounded-full">
                        <Image
                            src="https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar.avif"
                            alt={data.username}
                            width={48}
                            height={48}
                        />
                    </div>
                </div>
                <span>{data.username}</span>
            </div>
        },
    },
    {
        key: 'email',
        label: '联系方式',
        children: (data: any) => {
            return <div className='flex flex-col gap-2'>
                <span>{data.email}</span>
                <span>{data.tel}</span>
            </div>
        },
    },
    {
        key: 'qualtrics',
        label: 'Qualtrics',
        children: (data: any) => {
            return <div className='flex flex-col gap-2'>
                <a className="dooom-link" href={data.qualtrics}>{data.qualtrics}</a>
            </div>
        },
    },
    {
        key: 'user_role',
        label: '角色',
        children: (data: UserTableProps) => {
            const userGroups: Record<UserRole, { text: string; state: string }> = {
                USER: {
                    text: '测试者',
                    state: 'success'
                },
                ADMIN: {
                    text: '管理员',
                    state: 'error'
                },
                ASSISTANT: {
                    text: '助教',
                    state: 'pending'
                }
            }

            let obj = userGroups[data.user_role]

            return <div className='flex flex-col gap-2 items-start'>
                <State type={obj.state}>{obj.text}</State>
            </div>
        },
    },
    {
        key: 'user_group',
        label: '分组',
        children: (data: any) => {
            let group = Boolean(data?.user_group_name) ? {
                text: data.user_group_name,
                state: 'pending'
            } : {
                text: '暂无分组',
                state: 'warn'
            }
            return <div className='flex flex-col gap-2 items-start'>
                <State type={group.state}>{group.text}</State>
            </div>
        },
    },
    {
        key: 'create_time',
        label: '登录时间',
        hidden: true,
        children: (data: any) => {
            return <div className='flex flex-col gap-2 items-start'>
                <span className='text-xs'>创建时间: {data.create_time}</span>
                <span className='text-xs'>最近登录: {data.last_login_time}</span>
            </div>
        },
    },
    {
        key: 'id',
        label: '操作',
        hidden: true,
        children: (data: any) => {
            return <div className='flex gap-4 items-center'>
                <UserTableEditButtons userId={data.id} />
            </div>
        },
    }
]
