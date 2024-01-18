'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { userFormSchema } from '@/lib/validations/auth';
import { Icons } from '@/components/icons';
import { getUrl } from '@/lib/url';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
    closeModal?: Function;
    edit?: boolean;
    userId?: number;
    nano_id?: string;
}
type FormData = z.infer<typeof userFormSchema>;

export function UserCreateForm({
    className,
    nano_id,
    closeModal,
    edit,
    userId,
    ...props
}: UserAuthFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<FormData>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            username: '',
            password: '',
            email: '',
            tel: '',
        },
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function addUser(data: FormData) {
        try {
            const result = await fetch(getUrl('/api/user/add'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    nano_id: nano_id,
                    user_role: 'ASSISTANT',
                }),
            });
            if (result.ok) {
                const responseBody = await result.json();
                toast({
                    title: '创建成功',
                    description: responseBody.msg || '已成功创建新用户',
                    duration: 3000,
                });
                if (closeModal) {
                    closeModal();
                }
            } else {
                const responseBody = await result.json();
                toast({
                    title: '创建失败',
                    description: responseBody.msg || '请查看系统消息',
                    variant: 'destructive',
                    duration: 5000,
                });
            }
        } catch (error) {
            console.error('请求失败:', error);
            toast({
                title: '请求错误',
                description: '无法连接到服务器，请稍后再试。',
                variant: 'destructive',
                duration: 5000,
            });
        }
    }

    /**
     * 创建用户
     * @param data
     * @returns
     */
    async function onSubmit(data: FormData) {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        addUser(data);
        setIsLoading(false);
    }

    useEffect(() => {
        reset();
    }, [userId]);

    return (
        <div className={cn('grid gap-6', className)} {...props}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="username">
                            用户名
                        </label>
                        <input
                            data-name="username"
                            placeholder="请输入用户名"
                            type="text"
                            autoCapitalize="none"
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
                            登录密码
                        </label>
                        <input
                            data-name="password"
                            placeholder="请输入登录密码"
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
                        <label className="sr-only" htmlFor="email">
                            Email
                        </label>
                        <input
                            data-name="email"
                            placeholder="请输入email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="input input-bordered w-full"
                            {...register('email')}
                        />
                        {errors?.email && (
                            <p className="px-1 text-xs text-red-600">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="tel">
                            联系电话
                        </label>
                        <input
                            data-name="tel"
                            placeholder="请输入联系电话"
                            autoCapitalize="none"
                            autoComplete="tel"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="input input-bordered w-full"
                            {...register('tel')}
                        />
                    </div>
                    <button className={'btn btn-primary'} type="submit">
                        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}创建
                    </button>
                </div>
            </form>
        </div>
    );
}
