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
        // 成功之后跳转登录之前页面或者dashboard
        router.push('/login');
        return toast({
            title: '注册成功',
            description: '请在登录页面登录',
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
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="username">
                            用户名
                        </label>
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
                        {errors?.username && (
                            <p className="px-1 text-xs text-red-600">{errors.username.message}</p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="password">
                            密码
                        </label>
                        <input
                            data-name="password"
                            placeholder="请输入密码"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="password"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="input w-full"
                            /**
                             * 针对用户修改密码时，由于state不会实时更新以及refine/addIssue方法抛出错误后不会自动清除（并且zod似乎只有验证为false时，
                             * 才会让formState中的errors更新，这导致无法用Effect跟踪errors），故而更改了相关前端逻辑。
                             *
                             * 目前，当用户输入时，就会跳出红字提醒用户密码应满足的格式规范
                             */
                            {...register('password')}
                        />
                        {errors?.password && (
                            <p className="px-1 text-xs text-red-600">{errors.password.message}</p>
                        )}

                        {/**
                         * 应对自定义检查逻辑”密码必须包含至少一个大写字母，一个小写字母和一个数字“缺少前端提示的修补
                         * 通过判断errors是否存在""的消息确认是否显示。
                         *
                         * 但问题在于使用refine/addIssue方法抛出错误后，该存在在errors中的错误不会自动清除，除非调用trigger()方法。
                         *
                         * @todo 这段代码可能会在后续添加更多自定义逻辑项的时候出现问题。这一点需要注意。
                         */}
                        {/* {errors['']?.message && (
                            <p className="px-1 text-xs text-red-600">{errors[''].message}</p>
                        )} */}
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="invite_code">
                            邀请码
                        </label>
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
                        {errors?.invite_code && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.invite_code.message}
                            </p>
                        )}
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
