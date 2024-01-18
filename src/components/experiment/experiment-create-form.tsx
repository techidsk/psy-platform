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

import type { experiment, experiment_steps, engine as experimentEngine } from '@prisma/client';
import Image from 'next/image';

interface ExperimentCreateFormProps extends React.HTMLAttributes<HTMLDivElement> {
    experiment: experiment | null;
    nano_id: string;
    edit?: boolean;
    engines?: experimentEngine[] | null;
    steps?: experiment_steps[] | null;
}

type FormData = z.infer<typeof exprimentSchema>;

export function ExperimentCreateForm({
    className,
    experiment,
    nano_id,
    edit,
    engines,
    steps,
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
    const [engineId, setEngineId] = useState<number>(0);
    const [dispatch, setDispatch] = useState<string>('CREATE');
    const [experimentSteps, setExperimentSteps] = useState<any[]>([]);

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
        console.log(dispatch, data);
        if (dispatch === 'UPDATE') {
            // TODO: dispatch为update则进行patch操作
            const patchResult = await fetch(getUrl('/api/experiment/patch'), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                }),
            });
            setIsLoading(false);
            if (!patchResult?.ok) {
                return toast({
                    title: '更新失败',
                    description: '请查看系统消息',
                    variant: 'destructive',
                    duration: 5000,
                });
            }
            router.push('/experiment');
            router.refresh();
            return toast({
                title: '更新成功',
                description: '已成功创建新实验',
                duration: 3000,
            });
        } else {
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
    }

    const selectEngine = (id: number) => {
        setValue('engine_id', id);
        setEngineId(id);
    };

    const addSteps = (e: any) => {
        e.preventDefault();
    };

    const editSteps = (e: any) => {
        e.preventDefault();
    };

    const previewSteps = (e: any) => {
        e.preventDefault();
    };

    function initForm() {
        if (experiment) {
            setValue('experiment_name', experiment.experiment_name || '');
            setValue('description', experiment.description || '');
            if (experiment.engine_id) {
                setValue('engine_id', experiment.engine_id);
                setEngineId(experiment.engine_id);
            }
            steps && setExperimentSteps(steps);
        }
    }

    useEffect(() => {
        if (edit) {
            reset();
        } else {
            initForm();
            setDispatch('UPDATE');
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
                            data-name="experiment_name"
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
                    <div className="grid gap-2">
                        <label className="text-lg" htmlFor="engine_id">
                            选择引擎
                        </label>
                        <div className="flex gap-4">
                            {engines?.map((engine) => {
                                return (
                                    <div
                                        key={engine.id}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        <Image
                                            className="rounded"
                                            src={engine.engine_image}
                                            alt={engine.engine_name}
                                            width={96}
                                            height={96}
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                type="radio"
                                                className="radio"
                                                value={engine.engine_name}
                                                checked={engine.id === engineId}
                                                disabled={isLoading || !edit}
                                                onClick={() => selectEngine(engine.id)}
                                            />
                                            <label htmlFor={engine.engine_name}>
                                                {engine.engine_name}
                                            </label>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex gap-4">
                            <label className="text-lg" htmlFor="engine_id">
                                实验步骤
                            </label>
                            {!(isLoading || !edit) && (
                                <button
                                    className="btn btn-sm btn-ghost"
                                    onClick={(e) => addSteps(e)}
                                >
                                    <Icons.add size={16} />
                                </button>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <ul className="steps steps-vertical">
                                {experimentSteps && experimentSteps.length > 0 ? (
                                    experimentSteps?.map((step) => {
                                        return (
                                            <li className="step flex gap-2" key={step.id}>
                                                <div className="flex gap-2 items-center">
                                                    <div className="flex gap-2 items-center">
                                                        <div>{step.step_name}</div>
                                                        {step.type && <StepType type={step.type} />}
                                                    </div>
                                                    {!(isLoading || !edit) ? (
                                                        <div>
                                                            <button
                                                                className="btn btn-sm btn-ghost"
                                                                onClick={(e) => editSteps(e)}
                                                            >
                                                                <Icons.edit size={16} />
                                                                编辑
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <button
                                                                className="btn btn-sm btn-ghost"
                                                                onClick={(e) => previewSteps(e)}
                                                            >
                                                                <Icons.preview size={16} />
                                                                查看
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })
                                ) : (
                                    <div>当前暂无步骤，请手动添加</div>
                                )}
                            </ul>
                        </div>
                    </div>
                    {edit && (
                        <div className="flex justify-end">
                            <button className="btn btn-primary" disabled={isLoading} type="submit">
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

const StepType = ({ type }: { type: number }) => {
    switch (type) {
        case 1:
            return <span className="badge badge-outline">仅图文</span>;
        case 2:
            return <span className="badge badge-outline">左侧图片</span>;
        case 3:
            return <span className="badge badge-outline">右侧图片</span>;
        default:
            return <span className="badge badge-outline">仅图文</span>;
    }
};
