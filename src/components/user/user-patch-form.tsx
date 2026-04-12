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
import { FormField } from '@/components/ui/form-field';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
    closeModal: Function;
    edit?: boolean;
    userId?: number;
    nano_id?: string;
    currentUserRole?: string;
}
type FormData = z.infer<typeof userPatchFormSchema>;

const roleOptions = [
    { value: 'SUPERADMIN', label: '超级管理员' },
    { value: 'ADMIN', label: '管理员' },
    { value: 'ASSISTANT', label: '助教' },
    { value: 'USER', label: '测试者' },
    { value: 'GUEST', label: '访客' },
];

export function UserPatchForm({
    className,
    nano_id,
    closeModal,
    edit,
    userId,
    currentUserRole,
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
                if (data.user_role) setValue('user_role', data.user_role);
                setUserName(data.username);
            });
    }

    useEffect(() => {
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
                        <input
                            data-name="username"
                            placeholder="请输入用户名"
                            type="text"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={true}
                            value={userName}
                            className="input w-full"
                        />
                    </div>
                    <FormField label="登录密码" srOnly error={errors.password}>
                        <input
                            data-name="password"
                            placeholder="请输入登录密码"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="password"
                            autoCorrect="off"
                            disabled={Boolean(!nano_id) || isLoading}
                            className="input w-full"
                            {...register('password')}
                        />
                    </FormField>
                    <FormField label="Email" srOnly error={errors.email}>
                        <input
                            data-name="email"
                            placeholder="请输入email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="input w-full"
                            {...register('email')}
                        />
                    </FormField>
                    <FormField label="联系电话" srOnly>
                        <input
                            data-name="tel"
                            placeholder="请输入联系电话"
                            autoCapitalize="none"
                            autoComplete="tel"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="input w-full"
                            {...register('tel')}
                        />
                    </FormField>
                    {currentUserRole === 'SUPERADMIN' && (
                        <FormField label="用户角色">
                            <select
                                className="select w-full"
                                disabled={isLoading}
                                {...register('user_role')}
                            >
                                {roleOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </FormField>
                    )}
                    <button className={'btn btn-primary'} type="submit">
                        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                        保存
                    </button>
                </div>
            </form>
        </div>
    );
}
