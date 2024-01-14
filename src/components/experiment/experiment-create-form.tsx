'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { exprimentSchema } from '@/lib/validations/experiment';
import { Icons } from '@/components/icons';
import { getUrl } from '@/lib/url';

import type { experiment } from '@prisma/client';

interface ExperimentCreateFormProps extends React.HTMLAttributes<HTMLDivElement> {
    experiment: experiment | null;
    nano_id: string;
    edit?: boolean;
}

type FormData = z.infer<typeof exprimentSchema>;

export function ExperimentCreateForm({
    className,
    experiment,
    nano_id,
    edit,
    ...props
}: ExperimentCreateFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<FormData>({
        resolver: zodResolver(exprimentSchema),
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    /**
     * 创建实验
     * @param data 新实验信息
     * @returns
     */
    async function onSubmit(data: FormData) {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        const createResult = await fetch(getUrl('/api/experiment/add'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...data,
                nano_id: nano_id,
            }),
        });
        setIsLoading(false);
        if (!createResult?.ok) {
            return toast({
                title: '创建失败',
                description: '请查看系统消息',
                variant: 'destructive',
                duration: 5000,
            });
        }
        router.push('/experiment');
        router.refresh();
        return toast({
            title: '创建成功',
            description: '已成功创建新实验',
            duration: 3000,
        });
    }

    function initForm() {
        if (experiment) {
            setValue('experiment_name', experiment.experiment_name || '');
            setValue('description', experiment.description || '');
        }
    }

    useEffect(() => {
        if (edit) {
            reset();
        } else {
            initForm();
        }
    }, []);

    return (
        <div className={cn('grid gap-6', className)} {...props}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="experiment_name">
                            实验名称
                        </label>
                        <input
                            nano_id="experiment_name"
                            placeholder="请输入实验名称"
                            type="text"
                            autoCapitalize="none"
                            autoComplete="experiment_name"
                            autoCorrect="off"
                            disabled={isLoading || !edit}
                            className="input input-bordered w-full"
                            {...register('experiment_name')}
                        />
                        {errors?.experiment_name && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.experiment_name.message}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="description">
                            详情描述
                        </label>
                        <textarea
                            nano_id="description"
                            placeholder="请输入实验名称"
                            autoCapitalize="none"
                            autoComplete="description"
                            autoCorrect="off"
                            disabled={isLoading || !edit}
                            className="textarea textarea-bordered w-full"
                            rows={6}
                            {...register('description')}
                        />
                    </div>
                    {edit && (
                        <div className="flex justify-end">
                            <button
                                className={'btn btn-primary'}
                                disabled={isLoading}
                                type="submit"
                            >
                                {isLoading && (
                                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                完成
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
