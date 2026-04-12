'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { registerSchema } from '@/lib/validations/auth';
import { Icons } from '@/components/icons';
import { getUrl } from '@/lib/url';
import { FormField } from '@/components/ui/form-field';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
    qualtricsId?: string;
}
type FormData = z.infer<typeof registerSchema>;

export function UserRegisterForm({ qualtricsId, className, ...props }: UserAuthFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<FormData>({
        resolver: zodResolver(registerSchema),
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const search = useSearchParams();

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
        if (qualtricsId) {
            data.qualtrics = qualtricsId;
        }

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
        // 成功之后跳转首页登录
        router.push('/');
        return toast({
            title: '注册成功',
            description: '请在首页登录',
            duration: 3000,
        });
    }

    useEffect(() => {
        const code = search?.get('invite_code');
        if (code) {
            setValue('invite_code', code);
        }
    }, []);

    return (
        <div className={cn('grid gap-6', className)} {...props}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-2">
                    <FormField label="用户名" srOnly error={errors.username}>
                        <input
                            data-name="username"
                            placeholder="请输入用户名"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="username"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="input w-full"
                            {...register('username')}
                        />
                    </FormField>
                    <FormField label="密码" srOnly error={errors.password}>
                        <input
                            data-name="password"
                            placeholder="请输入密码"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="password"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="input w-full"
                            {...register('password')}
                        />
                    </FormField>
                    <FormField label="邀请码" srOnly error={errors.invite_code}>
                        <input
                            data-name="invite_code"
                            placeholder="请输入实验邀请码"
                            type="text"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="input w-full"
                            {...register('invite_code')}
                        />
                    </FormField>
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
