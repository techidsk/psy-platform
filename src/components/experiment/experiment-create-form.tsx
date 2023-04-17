"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { exprimentSchema } from "@/lib/validations/auth"
import { Icons } from "@/components/icons"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
    nanoId: string
}
type FormData = z.infer<typeof exprimentSchema>

export function ExperimentCreateForm({ className, nanoId, ...props }: UserAuthFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(exprimentSchema),
    })

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const router = useRouter()

    const searchParams = useSearchParams()
    async function onSubmit(data: FormData) {
        setIsLoading(true)
        console.log(data)
        console.log(searchParams)
        let url = process.env.NEXT_PUBLIC_BASE_URL + '/api/experiment/add'
        const createResult = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...data,
                nano_id: nanoId,
            })
        })
        console.log('createResult: ', createResult)
        setIsLoading(false)

        if (!createResult?.ok) {
            return toast({
                title: "Something went wrong.",
                description: "Your sign in request failed. Please try again.",
                variant: "destructive",
            })
        }
        router.push("/experiment")

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
                        <label className="sr-only" htmlFor="name">实验名称</label>
                        <input
                            id="name"
                            placeholder="请输入实验名称"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="name"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="input input-bordered w-full"
                            {...register("name")}
                        />
                        {errors?.name && (
                            <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="description">详情描述</label>
                        <textarea
                            id="description"
                            placeholder="请输入实验名称"
                            autoCapitalize="none"
                            autoComplete="description"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="textarea textarea-bordered w-full"
                            rows={6}
                            {...register("description")}
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
