import Link from 'next/link'
import { getCsrfToken, signIn } from "next-auth/react"


export default async function LoginForm({ savePass = false }) {
    const csrfToken = await getCsrfToken()


    function login() {
        console.log('login')
    }

    return (
        <div className='flex flex-col gap-6 h-full items-center justify-center' >
            <div className='login-form' style={{ width: 300 }}>
                <div className='flex flex-col gap-0 items-start'>
                    <label className="block text-gray-700 font-bold mb-2" for="username">
                        账号
                    </label>
                    <input className="input input-bordered w-full max-w-xs" type="text" id="username" placeholder="请输入用户名或者电子邮箱" />
                </div>
                <div className='flex flex-col gap-0 items-start'>
                    <label className="block text-gray-700 font-bold mb-2" for="password">
                        密码
                    </label>
                    <input className="input input-bordered w-full max-w-xs" type="password" id="password" placeholder="请输入密码" />
                </div>
                <div className='flex gap-4 justify-start'>
                    <input type="checkbox" defaultChecked={savePass} className="checkbox" />
                    <div>
                        记住密码
                    </div>
                </div>
            </div>

            <div className='flex flex-col gap-4'>
                <button className='btn btn-primary' style={{ width: 300, fontSize: 14 }} onClick={signIn}>
                    登录
                </button>
                <Link href='/register'>
                    <div className='flex justify-center'>
                        还没有账号？<span className='text-blue-600'>注册</span>
                    </div>
                </Link>
            </div>
        </div>
    )
}