"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { userFormSchema } from "@/lib/validations/auth"
import { Icons } from "@/components/icons"
import { getUrl } from "@/lib/url"

import type { user as User } from '@prisma/client'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
    user: User | null
    nano_id: string
}

type FormData = z.infer<typeof userFormSchema>

export function UserCreateForm({ className, user, nano_id, ...props }: UserAuthFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(userFormSchema),
    })

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const router = useRouter()


    /**
     * 创建用户
     * @param data 新实验信息
     * @returns 
     */
    async function onSubmit(data: FormData) {
        if (isLoading) {
            return
        }
        setIsLoading(true)
        const createResult = await fetch(getUrl('/api/user/add'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...data,
                nano_id: nano_id,
                user_role: 'ASSISTANT',
            })
        })
        setIsLoading(false)
        if (!createResult?.ok) {
            return toast({
                title: "创建失败",
                description: "请查看系统消息",
                variant: "destructive",
                duration: 5000
            })
        }
        router.push("/users")
        return toast({
            title: "创建成功",
            description: "已成功创建新用户",
            duration: 3000
        })
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="name">用户名</label>
                        <input
                            id="name"
                            placeholder="请输入用户名"
                            type="text"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="input input-bordered w-full"
                            {...register("username")}
                        />
                        {errors?.username && (
                            <p className="px-1 text-xs text-red-600">{errors.username.message}</p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="password">登录密码</label>
                        <input
                            id="password"
                            placeholder="请输入登录密码"
                            type="password"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="textarea textarea-bordered w-full"
                            {...register("password")}
                        />
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="email">Email</label>
                        <input
                            id="email"
                            placeholder="请输入email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="textarea textarea-bordered w-full"
                            {...register("email")}
                        />
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="tel">联系电话</label>
                        <input
                            id="tel"
                            placeholder="请输入联系电话"
                            autoCapitalize="none"
                            autoComplete="tel"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="textarea textarea-bordered w-full"
                            {...register("tel")}
                        />
                    </div>
                    <button className={'btn btn-primary'} disabled={isLoading} type="submit">
                        {isLoading && (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        创建
                    </button>
                </div>
            </form>
        </div>
    )
}
