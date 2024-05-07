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
import { ExperimentStepTab } from './experiment-step-tab';

interface ExperimentCreateFormProps extends React.HTMLAttributes<HTMLDivElement> {
    experiment: experiment | null;
    nano_id: string;
    edit?: boolean;
    engines?: experimentEngine[] | null;
    steps?: experiment_steps[] | null;
    add?: boolean;
}

type FormData = z.infer<typeof exprimentSchema>;

export function ExperimentCreateForm({
    className,
    experiment,
    nano_id,
    edit,
    engines,
    steps,
    add = false,
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
    const [dispatch, setDispatch] = useState<string>('CREATE');
    const [experimentSteps, setExperimentSteps] = useState<any[]>([]);

    const [tab, setTab] = useState('PROPERTY');
    const [engineIds, setEngineIds] = useState<number[]>([]);
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
        if (dispatch === 'UPDATE') {
            // TODO: dispatch为update则进行patch操作
            const patchResult = await fetch(getUrl('/api/experiment/patch'), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    nano_id: nano_id,
                    engine_ids: engineIds,
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
        } else {
            const createResult = await fetch(getUrl('/api/experiment/add'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    nano_id: nano_id,
                    engine_ids: engineIds,
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
        }
        router.back();

        return toast({
            title: dispatch === 'UPDATE' ? '更新成功' : '创建成功',
            description: '已成功完成操作',
            duration: 3000,
        });
    }

    const selectEngine = (engineId: number) => {
        if (isLoading || !edit) {
            return;
        }
        const prevEngineIds = engineIds;
        const newEngineIds = prevEngineIds.includes(engineId)
            ? prevEngineIds.filter((id) => id !== engineId)
            : [...prevEngineIds, engineId];

        setEngineIds(newEngineIds);
    };

    function initForm() {
        if (experiment) {
            // 编辑实验
            setValue('experiment_name', experiment.experiment_name || '');
            setValue('description', experiment.description || '');
            setValue('intro', experiment.intro || '');
            setEngineIds(experiment.engine_ids as number[]);
            setExperimentSteps(steps as experiment_steps[]);
        }
    }

    useEffect(() => {
        if (add) {
            setDispatch('CREATE');
            reset();
        } else {
            setDispatch('UPDATE');
        }
    }, [add]);

    useEffect(() => {
        // 判断是否是编辑模式
        // 如果是编辑模式
        // 则需要保留原有数据，否则显示
        initForm();
        console.log('initForm', '@experiment_create-fomr.tsx');
    }, []);

    return (
        <div className={cn('grid gap-6', className)} {...props}>
            {experiment?.id && (
                <div role="tablist" className="tabs tabs-boxed">
                    <a
                        role="tab"
                        className={`tab ${tab === 'PROPERTY' ? 'tab-active' : ''}`}
                        onClick={() => setTab('PROPERTY')}
                    >
                        实验属性
                    </a>
                    <a
                        role="tab"
                        className={`tab ${tab === 'TIMELINE' ? 'tab-active' : ''}`}
                        onClick={() => setTab('TIMELINE')}
                    >
                        实验流程
                    </a>
                </div>
            )}
            {tab === 'PROPERTY' && (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-2">
                        <>
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
                                    实验描述
                                </label>
                                <textarea
                                    data-name="description"
                                    placeholder="请输入实验描述"
                                    autoCapitalize="none"
                                    autoComplete="description"
                                    autoCorrect="off"
                                    disabled={isLoading || !edit}
                                    className="textarea textarea-bordered w-full"
                                    rows={2}
                                    {...register('description')}
                                />
                            </div>
                            <div className="grid gap-1">
                                <label className="sr-only" htmlFor="intro">
                                    项目介绍
                                </label>
                                <textarea
                                    data-name="intro"
                                    placeholder="请输入项目介绍"
                                    autoCapitalize="none"
                                    autoComplete="intro"
                                    autoCorrect="off"
                                    disabled={isLoading || !edit}
                                    className="textarea textarea-bordered w-full"
                                    rows={8}
                                    {...register('intro')}
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
                                                className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                                                onClick={() => selectEngine(engine.id)}
                                            >
                                                <Image
                                                    className="rounded"
                                                    src={engine.engine_image}
                                                    alt={engine.engine_name}
                                                    width={96}
                                                    height={96}
                                                />
                                                <div className="flex items-center ">
                                                    <input
                                                        type="checkbox"
                                                        className="toggle toggle-sm"
                                                        disabled={isLoading || !edit}
                                                        checked={engineIds.includes(engine.id)}
                                                        onChange={() => void 0}
                                                        // onChange={() => selectEngine(engine.id)}
                                                    />
                                                    <label
                                                        className="cursor-pointer"
                                                        htmlFor={engine.engine_name}
                                                    >
                                                        {engine.engine_name}
                                                    </label>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            {edit && (
                                <div className="flex justify-end">
                                    <button
                                        className="btn btn-primary"
                                        disabled={isLoading}
                                        type="submit"
                                    >
                                        {isLoading && (
                                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {dispatch === 'UPDATE' ? '更新' : '创建'}
                                    </button>
                                </div>
                            )}
                        </>
                    </div>
                </form>
            )}
            {tab === 'TIMELINE' && experiment?.id && (
                <ExperimentStepTab experimentId={experiment?.id} />
            )}
        </div>
    );
}
