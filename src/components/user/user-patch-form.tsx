'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { userPatchFormSchema } from '@/lib/validations/auth';
import { Icons } from '@/components/icons';
import { getUrl } from '@/lib/url';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
    closeModal: Function;
    edit?: boolean;
    userId?: number;
    nano_id?: string;
}
type FormData = z.infer<typeof userPatchFormSchema>;

export function UserPatchForm({
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
        resolver: zodResolver(userPatchFormSchema),
        defaultValues: {
            password: '',
            email: '',
            tel: '',
        },
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [userName, setUserName] = useState('');

    async function saveUser(data: FormData) {
        try {
            const result = await fetch(getUrl('/api/user/patch'), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    id: userId,
                }),
            });
            if (result.ok) {
                const responseBody = await result.json();
                toast({
                    title: '创建成功',
                    description: responseBody.msg || '已成功创建新用户',
                    duration: 3000,
                });
                closeModal();
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
     * @param data 新实验信息
     * @returns
     */
    async function onSubmit(data: FormData) {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        saveUser(data);
        setIsLoading(false);
    }

    async function getUser() {
        // 获取用户信息
        if (userId === undefined) {
            return;
        }

        await fetch(getUrl(`/api/user/${userId}`), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setValue('email', data.email);
                setValue('tel', data.tel);
                setUserName(data.username);
            });
    }

    useEffect(() => {
        console.log(Boolean(!nano_id));
        console.log(Boolean(!nano_id) || isLoading);
        if (!nano_id) {
            getUser();
        } else {
            reset();
        }
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
                            nano_id="username"
                            placeholder="请输入用户名"
                            type="text"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={true}
                            value={userName}
                            className="input input-bordered w-full"
                        />
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="password">
                            登录密码
                        </label>
                        <input
                            nano_id="password"
                            placeholder="请输入登录密码"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="password"
                            autoCorrect="off"
                            disabled={Boolean(!nano_id) || isLoading}
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
                            nano_id="email"
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
                            nano_id="tel"
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
                        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                        保存
                    </button>
                </div>
            </form>
        </div>
    );
}
