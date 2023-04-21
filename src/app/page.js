
import LoginForm from './loginForm.js'
import LoginClient from './loginClient.js'
import Link from 'next/link.js'

// import './register/register.css'

export default function Home() {

  return (
    <div className='h-screen'>
      <div className='login-left w-96 hidden md:block' />
      <div className='bg-white login-right ml-0 md:ml-96 '>
        <div className='flex flex-col gap-4 justify-center items-center h-screen'>
          <h1 className='font-bold text-gray-800 text-3xl mb-8'>欢迎</h1>
          <Link href={'/login'} className='btn btn-primary w-[360px]'>登录</Link>
          <Link href={'/register'} className='btn btn-ghost btn-outline w-[360px]'>注册</Link>
        </div>
      </div>
    </div>
  )
}
