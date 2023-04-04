"use client"
import { useEffect, useState } from 'react'
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Label from '@radix-ui/react-label';
import Link from 'next/link'
import { useRef } from 'react'
import { useRouter } from 'next/navigation';
import { CheckIcon } from '@radix-ui/react-icons';
import store from 'store2';

const crypto = require('crypto')

import './register/register.css'


export default function Home() {
  const router = useRouter()

  const usernameRef = useRef(null)
  const passwordRef = useRef(null)

  const [savePass, setSavePass] = useState(false)

  useEffect(() => {
    setSavePass(store('savePass') || false)
    usernameRef.current.defaultValue = decode('username') || ''
    passwordRef.current.defaultValue = decode('password') || ''
  }, [])

  async function login() {

    const username = usernameRef.current.value
    const regex = /^[a-zA-Z0-9_]+$/;
    if (!regex.test(username)) {
      // 用户名不合法
      // todo 异常弹窗
    }
    const password = passwordRef.current.value
    if (password.length < 6) {
      // todo 密码长度小于6异常
    }

    // 处理保存
    if (savePass) {
      const key = crypto.randomBytes(32);
      const iv = crypto.randomBytes(16)
      store('key', key.toString('hex'))
      store('iv', iv.toString('hex'))
      store('username', encode(username, key, iv))
      store('password', encode(password, key, iv))
      store('savePass', true)
    }

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password,
      })
    })
    const r = await response.json()
    if (!response.ok) {
      console.log(r['msg'])
      // todo 处理登录失败
      // throw new Error('Failed to register user');
    }
    if (r['msg'] === 'success') {
      // todo 角色判断到dashboard
      router.push('/experiment/intro')
    }
  }

  function encode(str, key, iv) {
    try {
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      return cipher.update(str, 'utf8', 'hex') + cipher.final('hex');
    } catch (err) {
      return err.message || err;
    }
  }

  function decode(name) {
    let str = store(name) || ''
    if (!str) {
      return ''
    }
    let key = Buffer.from(store('key'), 'hex')
    let iv = Buffer.from(store('iv'), 'hex');

    try {
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      return decipher.update(str, 'hex', 'utf8') + decipher.final('utf8');
    } catch (err) {
      return err.message || err;
    }
  }

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
              <input className="Input" type="text" id="firstName" ref={usernameRef} placeholder="请输入用户名或者电子邮箱" />
            </div>
            <div className='flex flex-col gap-0 items-start'>
              <Label.Root className="LabelRoot" htmlFor="firstName">
                密码
              </Label.Root>
              <input className="Input" type="password" id="firstName" ref={passwordRef} placeholder="请输入密码" />
            </div>
            <div className='flex gap-4 justify-start'>
              <Checkbox.Root className="CheckboxRoot" checked={savePass} id="c1" onClick={() => setSavePass(!savePass)}>
                <Checkbox.Indicator className="CheckboxIndicator">
                  <CheckIcon />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <div>
                记住密码
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-4'>
            <button className='primary-btn btn-md' style={{ width: 300 }} onClick={login}>
              登录
            </button>
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
