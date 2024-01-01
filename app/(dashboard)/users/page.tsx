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

async function getUsers() {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
        return []
    }
    const role = currentUser.role
    if (role === 'USER') {
        return []
    }

    // 判断当前用户角色
    let users = undefined
    if (role === 'ADMIN') {
        users = await db.$queryRaw<UserTableProps[]>`
            select u.id, u.username, u.email, u.tel, u.avatar, u.user_role, u.create_time, u.qualtrics, u.last_login_time,
            g.group_name as user_group_name, e.engine_name as user_engine_name, e.engine_image, count(m.id) as manager_count
            from user u
            LEFT JOIN user m ON u.id = m.manager_id
            left join user_group g on g.id = u.user_group_id
            left join user_setting s on s.user_id = u.id
            left join engine e on e.id = s.engine_id
            where u.deleted = 0
            GROUP BY u.id, u.manager_id
        `;
    } else {
        users = await db.$queryRaw<UserTableProps[]>`
            select u.id, u.username, u.email, u.tel, u.avatar, u.user_role, u.create_time, u.qualtrics, u.last_login_time,
            g.group_name as user_group_name, e.engine_name as user_engine_name, e.engine_image, count(m.id) as manager_count
            from user u
            LEFT JOIN user m ON u.id = m.manager_id
            left join user_group g on g.id = u.user_group_id
            left join user_setting s on s.user_id = u.id
            left join engine e on e.id = s.engine_id
            where u.manager_id = ${currentUser.id}
            and u.deleted = 0
            GROUP BY u.id, u.manager_id
        `;
    }

    return users.map(user => {
        return {
            ...user,
            avatar: 'https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar.avif',
            create_time: dateFormat(user.create_time),
            last_login_time: dateFormat(user.last_login_time),
        }
    })
}

export default async function User() {
    const datas = await getUsers();

    return (
        <div className='container mx-auto'>
            <div className='flex flex-col gap-4'>
                <DashboardHeader heading="用户列表" text="管理相关用户">
                    <CreateUserButton className='btn btn-primary btn-sm' />
                </DashboardHeader>
                <div className='w-full overflow-auto'>
                    <Table configs={userTableConfig} datas={datas} />
                    <div className="join">
                        <button className="join-item btn">1</button>
                        <button className="join-item btn btn-active">2</button>
                        <button className="join-item btn">3</button>
                        <button className="join-item btn">4</button>
                    </div>
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
