import Header from '@/components/header'
import Link from 'next/link';
import './styles.css'
import { Suspense } from 'react';
import { PlayIcon, TrashIcon, PaperPlaneIcon, PlusIcon } from '@radix-ui/react-icons'
import UserTable from './userTable'

/**实验员管理用户列表 */
export default function UserList() {

    return (
        <div className='h-screen bg-white'>
            <Header />
            <div className='container mx-auto px-8 py-8'>
                <div className='flex flex-col gap-4'>
                    <div className='text-lg font-bold'>
                        用户列表
                    </div>
                    <div className='flex flex-col gap-4'>
                        <div className='flex gap-4'>
                            <label htmlFor="my-modal" className="btn btn-primary btn-sm">
                                <PlusIcon height={20} width={20} />添加用户
                            </label>
                        </div>
                        <Suspense fallback={<div>Loading...</div>}>
                            <UserTable />
                        </Suspense>
                    </div>
                </div>
            </div>
            {/* Put this part before </body> tag */}
            <input type="checkbox" id="my-modal" className="modal-toggle" />
            <div className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">创建用户</h3>
                    <div className='flex flex-col gap-4'>
                        <div className="form-control w-full max-w-xs">
                            <label className="label">
                                <span className="label-text">用户名</span>
                            </label>
                            <input type="text" placeholder="请输入用户名" className="input input-bordered w-full max-w-xs border border-solid border-slate-400" />
                        </div>
                        <div className="form-control w-full max-w-xs">
                            <label className="label">
                                <span className="label-text">邮箱</span>
                            </label>
                            <input type="text" placeholder="请输入邮箱" className="input input-bordered w-full max-w-xs border border-solid border-slate-400" />
                        </div>
                    </div>
                    <div className="modal-action">
                        <label htmlFor="my-modal" className="btn btn-primary btn-sm">添加</label>
                        <label htmlFor="my-modal" className="btn btn-outline btn-sm">取消</label>
                    </div>
                </div>
            </div>
        </div>
    )
}
