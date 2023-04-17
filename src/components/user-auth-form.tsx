"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import store from 'store2';

import { cn } from "@/lib/utils"
import { userAuthSchema } from "@/lib/validations/auth"
import { Icons } from "@/components/icons"
const crypto = require('crypto')

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> { }
type FormData = z.infer<typeof userAuthSchema>

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(userAuthSchema),
    })

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [savePass, setSavePass] = useState<boolean>(false)

    const router = useRouter()

    useEffect(() => {
        setSavePass(store('savePass') || false)
        setValue('username', decode('username') || '')
        setValue('password', decode('password') || '')
    }, [])

    const searchParams = useSearchParams()
    async function onSubmit(data: FormData) {
        setIsLoading(true)
        const signInResult = await signIn("credentials", {
            username: data.username,
            password: data.password,
            redirect: false,
            callbackUrl: searchParams?.get("from") || "/dashboard",
        })
        setIsLoading(false)

        if (!signInResult?.ok) {
            return toast({
                title: "Something went wrong.",
                description: "Your sign in request failed. Please try again.",
                variant: "destructive",
            })
        }
        // 成功之后跳转登录之前页面或者dashboard
        router.push(signInResult.url || "/dashboard")

        return toast({
            title: "Check your email",
            description: "We sent you a login link. Be sure to check your spam too.",
        })
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="username">用户名</label>
                        <input
                            id="username"
                            placeholder="请输入用户名"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="username"
                            autoCorrect="off"
                            disabled={isLoading || isGitHubLoading}
                            className="input input-bordered w-full"
                            {...register("username")}
                        />
                        {errors?.username && (
                            <p className="px-1 text-xs text-red-600">{errors.username.message}</p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="password">密码</label>
                        <input
                            id="password"
                            placeholder="请输入密码"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="password"
                            autoCorrect="off"
                            disabled={isLoading || isGitHubLoading}
                            className="input input-bordered w-full"
                            {...register("password")}
                        />
                        {errors?.password && (
                            <p className="px-1 text-xs text-red-600">{errors.password.message}</p>
                        )}
                    </div>
                    <div className="flex gap-2 mb-2">
                        <input type="checkbox" defaultChecked={savePass} className="checkbox" onChange={() => setSavePass(!savePass)} />
                        <div>
                            记住密码
                        </div>
                    </div>
                    <button className={'btn btn-primary'} disabled={isLoading} type="submit">
                        {isLoading && (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        登录
                    </button>
                </div>
            </form>
        </div>
    )
}


function encode(str: string, key: string, iv: string) {
    try {
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        return cipher.update(str, 'utf8', 'hex') + cipher.final('hex');
    } catch (err: any) {
        return err.message || err;
    }
}

function decode(name: string) {
    let str = store(name) || ''
    if (!str) {
        return ''
    }
    let key = Buffer.from(store('key'), 'hex')
    let iv = Buffer.from(store('iv'), 'hex');

    try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        return decipher.update(str, 'hex', 'utf8') + decipher.final('utf8');
    } catch (err: any) {
        return err.message || err;
    }
}