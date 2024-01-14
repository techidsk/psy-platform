'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { getUrl } from '@/lib/url';
import { enginePatchFormSchema } from '@/lib/validations/engine';

interface EngineFormProps extends React.HTMLAttributes<HTMLDivElement> {
    closeModal: Function;
    edit?: boolean;
    engineId?: number;
    nano_id?: string;
}
type FormData = z.infer<typeof enginePatchFormSchema>;

export function EnginePatchForm({
    className,
    nano_id,
    closeModal,
    edit,
    engineId,
    ...props
}: EngineFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<FormData>({
        resolver: zodResolver(enginePatchFormSchema),
        defaultValues: {
            engine_name: '',
            engine_description: '',
            gpt_prompt: '',
        },
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function saveEngine(data: FormData) {
        try {
            const result = await fetch(getUrl('/api/engine/patch'), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    id: engineId,
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
        saveEngine(data);
        setIsLoading(false);
    }

    async function getEngine() {
        // 获取用户信息
        if (engineId === undefined) {
            return;
        }

        await fetch(getUrl(`/api/engine/${engineId}`), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setValue('engine_name', data.engine_name);
                setValue('engine_description', data.engine_description);
                setValue('gpt_prompt', data.gpt_prompt);
            });
    }

    useEffect(() => {
        if (!nano_id) {
            getEngine();
        } else {
            reset();
        }
    }, [engineId]);

    return (
        <div className={cn('grid gap-6', className)} {...props}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="engine_name">
                            引擎名称
                        </label>
                        <input
                            nano_id="engine_name"
                            placeholder="请输入引擎名称"
                            type="text"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="input input-bordered w-full"
                            {...register('engine_name')}
                        />
                        {errors?.engine_name && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.engine_name.message}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="engine_description">
                            引擎描述
                        </label>
                        <input
                            nano_id="engine_description"
                            placeholder="请输入引擎描述"
                            type="text"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="input input-bordered w-full"
                            {...register('engine_description')}
                        />
                        {errors?.engine_description && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.engine_description.message}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="gpt_prompt">
                            GPT提示词
                        </label>
                        <textarea
                            nano_id="gpt_prompt"
                            placeholder="请输入GPT提示词"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="textarea textarea-bordered w-full"
                            rows={6}
                            {...register('gpt_prompt')}
                        />
                        {errors?.gpt_prompt && (
                            <p className="px-1 text-xs text-red-600">{errors.gpt_prompt.message}</p>
                        )}
                    </div>
                    <button className="btn btn-primary" type="submit">
                        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                        保存
                    </button>
                </div>
            </form>
        </div>
    );
}
