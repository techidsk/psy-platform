'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { engineFormSchema } from '@/lib/validations/engine';
import { Icons } from '@/components/icons';
import { getUrl } from '@/lib/url';

interface EngineFormProps extends React.HTMLAttributes<HTMLDivElement> {
    // closeModal: Function;
    edit?: boolean;
    userId?: number;
    engine_id?: string;
    engine?: any;
}
type FormData = z.infer<typeof engineFormSchema>;

export function EngineAddForm({
    className,
    engine_id,
    // closeModal,
    edit,
    userId,
    ...props
}: EngineFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<FormData>({
        resolver: zodResolver(engineFormSchema),
        defaultValues: {
            engine_name: '',
            engine_description: '',
            gpt_prompt: '',
            temperature: 0.7,
            max_tokens: 300,
            prompt: '',
            negative_prompt: '',
        },
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);

    async function addEngine(data: FormData) {
        try {
            console.log('this is engine form: ', data);
            // const result = await fetch(getUrl('/api/user/add'), {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         ...data,
            //         id: engine_id,
            //     }),
            // });
            // if (result.ok) {
            //     const responseBody = await result.json();
            //     toast({
            //         title: '创建成功',
            //         description: responseBody.msg || '已成功创建新用户',
            //         duration: 3000,
            //     });
            //     closeModal();
            // } else {
            //     const responseBody = await result.json();
            //     toast({
            //         title: '创建失败',
            //         description: responseBody.msg || '请查看系统消息',
            //         variant: 'destructive',
            //         duration: 5000,
            //     });
            // }
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
        addEngine(data);
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
                        <label className="sr-only" htmlFor="engine_name">
                            引擎名称
                        </label>
                        <input
                            data-name="engine_name"
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
                            data-name="engine_description"
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
                        <input
                            data-name="gpt_prompt"
                            placeholder="请输入GPT提示词"
                            type="text"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="input input-bordered w-full"
                            {...register('gpt_prompt')}
                        />
                        {errors?.gpt_prompt && (
                            <p className="px-1 text-xs text-red-600">{errors.gpt_prompt.message}</p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="temperature">
                            GPT Temperature
                        </label>
                        <input
                            data-name="temperature"
                            placeholder="请输入GPT temperature"
                            min={0}
                            max={1}
                            type="number"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="input input-bordered w-full"
                            {...register('temperature')}
                        />
                        {errors?.temperature && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.temperature.message}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="max_tokens">
                            GPT最大tokens
                        </label>
                        <input
                            data-name="max_tokens"
                            placeholder="请输入GPT最大tokens"
                            min={100}
                            max={2048}
                            type="number"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="input input-bordered w-full"
                            {...register('max_tokens')}
                        />
                        {errors?.max_tokens && (
                            <p className="px-1 text-xs text-red-600">{errors.max_tokens.message}</p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="prompt">
                            SDXL提示词模板
                        </label>
                        <textarea
                            nano_id="prompt"
                            placeholder="请输入SDXL提示词模板"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="textarea textarea-bordered w-full"
                            {...register('prompt')}
                        />
                        {errors?.prompt && (
                            <p className="px-1 text-xs text-red-600">{errors.prompt.message}</p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="negative_prompt">
                            SDXL负面提示词
                        </label>
                        <textarea
                            nano_id="negative_prompt"
                            placeholder="请输入SDXL负面提示词"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="textarea textarea-bordered w-full"
                            {...register('negative_prompt')}
                        />
                        {errors?.negative_prompt && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.negative_prompt.message}
                            </p>
                        )}
                    </div>

                    <button className={'btn btn-primary'} type="submit">
                        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}创建
                    </button>
                </div>
            </form>
        </div>
    );
}
