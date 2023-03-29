"use client"
import * as Label from '@radix-ui/react-label';
import Link from 'next/link'

export default function Home() {
  return (
    <div className='h-screen'>
      <div className='login-left w-96 hidden md:block' />
      <div className='bg-white login-right ml-0 md:ml-96 '>
        <div className='flex flex-col gap-6 h-full items-center justify-center'>
          <div className='login-form'>
            <div className='flex flex-col gap-0 items-start'>
              <Label.Root className="LabelRoot" htmlFor="firstName">
                账号
              </Label.Root>
              <input className="Input" type="text" id="firstName" placeholder="请输入用户名或者电子邮箱" />
            </div>
            <div className='flex flex-col gap-0 items-start'>
              <Label.Root className="LabelRoot" htmlFor="firstName">
                密码
              </Label.Root>
              <input className="Input" type="text" id="firstName" placeholder="请输入密码" />
            </div>
          </div>
          <div className='flex flex-col gap-4'>
            <button className='primary-btn btn-md' style={{ width: 300 }}>
              登录
            </button>
            <Link href='/experiment/intro'>
              <button className='secondary-btn btn-md' style={{ width: 300 }}>
                直接开始
              </button>
            </Link>
            <Link href='/register'>
              <div className='flex justify-center'>
                还没有账号？<span className='text-blue-600'>注册</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
