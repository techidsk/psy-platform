import Image from 'next/image';
import { db } from '@/lib/db';
import { DashboardHeader } from '@/components/dashboard-header';
import { Table } from '@/components/table';
import { TableConfig } from '@/types/table';
import { State } from '@/components/state';
import { dateFormat } from '@/lib/date';


type UserTableProps = {
    id: string
    username: string
    email?: string
    tel?: string
    avatar: string
    user_role: string
    create_time: Date
    user_group_id: BigInt
    qualtrics?: string
    user_group_name: string
    user_engine_name: string
    engine_image: string
}


async function getUsers() {
    const users = await db.$queryRaw<UserTableProps[]>`
        select u.id, u.username, u.email, u.tel, u.avatar, u.user_role, u.create_time, u.qualtrics,
        g.group_name as user_group_name, e.engine_name as user_engine_name, e.engine_image
        from psy_user u
        left join psy_user_group g on g.id = u.user_group_id
        left join psy_user_setting s on s.user_id = u.id
        left join psy_engine e on e.id = s.engine_id
    `

    let formatResult = users.map(user => {
        return {
            ...user,
            id: user.id.toString(),
            avatar: 'https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar.avif',
            create_time: dateFormat(user.create_time)
        }
    })
    return formatResult
}

export default async function User() {
    const datas = await getUsers();

    return (
        <div className='container mx-auto'>
            <div className='flex flex-col gap-4'>
                <DashboardHeader heading="用户列表" text="管理相关用户">
                </DashboardHeader>
                <div className='w-full overflow-auto'>
                    <Table configs={experimentTableConfig} datas={datas} />
                </div>
            </div>
        </div>
    );
}


const experimentTableConfig: TableConfig[] = [
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
        label: '邮箱',
        children: (data: any) => {
            return <div className='flex flex-col gap-2'>
                <span>{data.email}</span>
            </div>
        },
    },
    {
        key: 'qualtrics',
        label: 'Qualtrics',
        children: (data: any) => {
            return <div className='flex flex-col gap-2'>
                <span>{data.qualtrics}</span>
            </div>
        },
    },
    {
        key: 'user_role',
        label: '角色',
        children: (data: any) => {
            let obj = Boolean(data.user_role === 'USER') ? {
                text: '测试者',
                state: 'pending'
            } : {
                text: '管理员',
                state: 'error'
            }
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
        key: 'id',
        label: '操作',
        hidden: true,
        children: (data: any) => {
            return <div className='flex gap-4 items-center'>
                <button className="btn btn-ghost btn-sm">编辑</button>
                <button className="btn btn-ghost btn-sm">删除</button>
            </div>
        },
    }
]
