'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { registerSchema } from '@/lib/validations/auth';
import { Icons } from '@/components/icons';
import { getUrl } from '@/lib/url';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}
type FormData = z.infer<typeof registerSchema>;

export function UserRegisterForm({ className, ...props }: UserAuthFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(registerSchema),
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    /**
     * 用户注册请求
     *
     * @param data - The form data containing the username and password.
     * @returns A toast notification indicating the success or failure of the registration.
     */
    async function onSubmit(data: FormData) {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        const result = await fetch(getUrl('/api/register'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...data,
            }),
        });
        setIsLoading(false);
        if (!result?.ok) {
            return toast({
                title: '注册失败',
                description: '用户名已注册',
                variant: 'destructive',
                duration: 5000,
            });
        }
        // 成功之后跳转登录之前页面或者dashboard
        router.push('/login');
        return toast({
            title: '注册成功',
            description: '请在登录页面登录',
            duration: 3000,
        });
    }

    return (
        <div className={cn('grid gap-6', className)} {...props}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="username">
                            用户名
                        </label>
                        <input
                            nano_id="username"
                            placeholder="请输入用户名"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="username"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="input input-bordered w-full"
                            {...register('username')}
                        />
                        {errors?.username && (
                            <p className="px-1 text-xs text-red-600">{errors.username.message}</p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="password">
                            密码
                        </label>
                        <input
                            nano_id="password"
                            placeholder="请输入密码"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="password"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="input input-bordered w-full"
                            {...register('password')}
                        />
                        {errors?.password && (
                            <p className="px-1 text-xs text-red-600">{errors.password.message}</p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="password">
                            Qualtrics账号
                        </label>
                        <input
                            nano_id="qualtrics"
                            placeholder="请输入Qualtrics账号"
                            type="text"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="input input-bordered w-full"
                            {...register('qualtrics')}
                        />
                    </div>
                    <button
                        className="btn btn-outline btn-primary"
                        disabled={isLoading}
                        type="submit"
                    >
                        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                        注册
                    </button>
                </div>
            </form>
        </div>
    );
}
