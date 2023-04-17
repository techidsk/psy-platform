'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation';
import store from 'store2';
import Link from 'next/link'
import { getCsrfToken, useSession, signIn } from "next-auth/react"

const crypto = require('crypto')

// import './register/register.css'


export default function LoginClient({ children }) {
    const router = useRouter()
    const { data } = useSession()

    const usernameRef = useRef(null)
    const passwordRef = useRef(null)

    const [savePass, setSavePass] = useState(false)

    // useEffect(() => {
    //     setSavePass(store('savePass') || false)
    // usernameRef.current.defaultValue = decode('username') || ''
    // passwordRef.current.defaultValue = decode('password') || ''
    // }, [])

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

        const response = await fetch('/api/auth/login', {
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
            throw new Error('Failed to register user');
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
        <>{children}</>
    )
}
