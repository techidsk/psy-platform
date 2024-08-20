'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { userPrivacySchema } from '@/lib/validations/user';
import { Icons } from '@/components/icons';
import { getUrl } from '@/lib/url';
import { AGES_MAP, GENDER_MAP } from '@/common/user';
import store from 'store2';
import { logger } from '@/lib/logger';

interface UserPrivacyProps extends React.HTMLAttributes<HTMLDivElement> {
    closeModal: Function;
    userId?: number;
    nano_id?: string;
    guest?: boolean;
}
type FormData = z.infer<typeof userPrivacySchema>;

function getKeyFromMap(value: any, map: any) {
    return Object.keys(map).find((key) => map[key] === value);
}
const GUEST_QUALTRICS_ID = 'guestQualtricsId';

export function UserPrivacyForm({
    className,
    nano_id,
    closeModal,
    userId,
    guest = false,
    ...props
}: UserPrivacyProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<FormData>({
        resolver: zodResolver(userPrivacySchema),
        defaultValues: {
            gender: '',
            ages: '',
        },
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    // 添加 qualtrics 是否可以编辑
    const [isQualtricsEditable, setIsQualtricsEditable] = useState<boolean>(true);

    async function updateUserPrivacy(data: FormData) {
        try {
            const params = {
                ...data,
                gender: parseInt(getKeyFromMap(data.gender, GENDER_MAP) as string),
                ages: parseInt(getKeyFromMap(data.ages, AGES_MAP) as string),
            };
            const result = await fetch(getUrl('/api/user/privacy'), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...params,
                    id: userId,
                }),
            });
            if (result.ok) {
                const responseBody = await result.json();
                toast({
                    title: '更新成功',
                    description: responseBody.msg || '已成功保存',
                    duration: 3000,
                });
                closeModal();
            } else {
                const responseBody = await result.json();
                toast({
                    title: '更新失败',
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
        updateUserPrivacy(data);
        setIsLoading(false);
    }

    /**
     * 初始化用户信息
     * @returns
     */
    async function getUser() {
        // 获取用户信息
        if (userId === undefined) {
            return;
        }

        await fetch(getUrl(`/api/user/privacy/${userId}`), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setValue('gender', data.gender || '');
                setValue('ages', data.ages || '');
                // TODO 添加根据项目来判断是否需要qualtrics
                const qualtricsIdJson = JSON.parse(store.get(GUEST_QUALTRICS_ID) || '{}');
                const qualtricsId = qualtricsIdJson['value'];
                setIsQualtricsEditable(qualtricsId === undefined);

                setValue('qualtrics', qualtricsId || data.qualtrics || '');
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
                <div className="flex flex-col gap-2">
                    <div className="flex gap-6 items-center">
                        <label className="text-gray-500 min-w-[144px]" htmlFor="gender">
                            性别
                        </label>
                        <select
                            data-name="gender"
                            disabled={isLoading}
                            className="select select-bordered w-full max-w-xs"
                            {...register('gender')}
                        >
                            {Object.entries(GENDER_MAP).map(([key, value]) => (
                                <option key={key} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                        {errors?.gender && (
                            <p className="px-1 text-xs text-red-600">{errors.gender.message}</p>
                        )}
                    </div>
                    <div className="flex gap-6 items-center">
                        <label className="text-gray-500 min-w-[144px]" htmlFor="ages">
                            年龄段
                        </label>
                        <select
                            data-name="ages"
                            disabled={isLoading}
                            className="select select-bordered w-full max-w-xs"
                            {...register('ages')}
                        >
                            {Object.entries(AGES_MAP).map(([key, value]) => (
                                <option key={key} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                        {errors?.ages && (
                            <p className="px-1 text-xs text-red-600">{errors.ages.message}</p>
                        )}
                    </div>
                    {
                        <div className="flex gap-6 items-center">
                            <label className="text-gray-500 min-w-[144px]" htmlFor="ages">
                                个人编号
                            </label>
                            <input
                                data-name="qualtrics"
                                placeholder="请输入您被分配的个人编号, 如果未分配，请留空"
                                type="text"
                                autoCapitalize="none"
                                autoCorrect="off"
                                disabled={isLoading || !isQualtricsEditable}
                                className="input input-bordered w-full"
                                {...register('qualtrics')}
                            />
                        </div>
                    }
                    <button className="btn btn-primary" type="submit">
                        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                        保存
                    </button>
                </div>
            </form>
        </div>
    );
}
