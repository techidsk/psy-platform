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
import { Modal } from '../ui/modal';
import { ExperimentStepForm } from './experiment-step-form';

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
    const [stepDispatch, setStepDispatch] = useState<string>('CREATE');
    const [experimentSteps, setExperimentSteps] = useState<any[]>([]);

    const [step, setStep] = useState<experiment_steps | null>();

    const [openStepForm, setOpenStepForm] = useState<boolean>(false);

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
                    steps: [...experimentSteps],
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
                    steps: [...experimentSteps],
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
        // router.push('/experiment');
        router.refresh();

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

    const addSteps = (e: any) => {
        e.preventDefault();
        setStep(null);
        setStepDispatch('CREATE');
        setOpenStepForm(true);
    };

    const editSteps = (e: any, step: experiment_steps) => {
        e.preventDefault();
        setStep(step);
        setStepDispatch('UPDATE');
        setOpenStepForm(true);
    };

    const removeSteps = (e: any, step: experiment_steps) => {
        e.preventDefault();
        setExperimentSteps((prev) => prev.filter((s) => s.id !== step.id));
    };

    const previewSteps = (e: any) => {
        e.preventDefault();
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
    }, []);

    return (
        <div className={cn('grid gap-6', className)} {...props}>
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
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-2">
                    {tab === 'PROPERTY' && (
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
                        </>
                    )}
                    {tab === 'TIMELINE' && (
                        <>
                            <div className="grid gap-2">
                                <div className="flex gap-4 items-center justify-between">
                                    <label className="text-lg" htmlFor="engine_id">
                                        实验步骤
                                    </label>
                                    {!(isLoading || !edit) && (
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={(e) => addSteps(e)}
                                        >
                                            <Icons.add size={16} />
                                            新增
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-full">
                                        <table className="table">
                                            {/* head */}
                                            <thead>
                                                <tr>
                                                    <th></th>
                                                    <th>类型</th>
                                                    <th>步骤标题</th>
                                                    <th>步骤详情</th>
                                                    <th>操作</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <StepItem
                                                    experimentSteps={experimentSteps}
                                                    isLoading={isLoading}
                                                    edit={Boolean(edit)}
                                                    editSteps={editSteps}
                                                    removeSteps={removeSteps}
                                                    previewSteps={previewSteps}
                                                />
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {edit && (
                        <div className="flex justify-end">
                            <button className="btn btn-primary" disabled={isLoading} type="submit">
                                {isLoading && (
                                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {dispatch === 'UPDATE' ? '更新' : '创建'}
                            </button>
                        </div>
                    )}
                </div>
            </form>
            {openStepForm && (
                <Modal
                    className="flex flex-col gap-4"
                    open={openStepForm}
                    onClose={() => setOpenStepForm(false)}
                    disableClickOutside={!open}
                >
                    <ExperimentStepForm
                        step={step}
                        closeModal={() => setOpenStepForm(false)}
                        experimentSteps={experimentSteps}
                        setExperimentSteps={setExperimentSteps}
                        dispatch={stepDispatch}
                    />
                </Modal>
            )}
        </div>
    );
}

// TODO random id bug
// interface StepVoProps extends experiment_steps {
//     random_id?: string;
// }

interface StepItemProps {
    experimentSteps: experiment_steps[] | null;
    isLoading: boolean;
    edit: boolean;
    editSteps: Function;
    removeSteps: Function;
    previewSteps: Function;
}

function StepItem({
    experimentSteps,
    isLoading,
    edit,
    editSteps,
    removeSteps,
    previewSteps,
}: StepItemProps) {
    return (
        <>
            {experimentSteps && experimentSteps.length > 0 ? (
                <>
                    {experimentSteps?.map((step, index) => {
                        return (
                            <tr key={`${step.type}_${step.step_name}`}>
                                <th>{index + 1}</th>
                                <td>
                                    {step.type && (
                                        <div className="w-20 text-left">
                                            <StepType type={step.type} />
                                        </div>
                                    )}
                                </td>
                                <td>{step.step_name}</td>
                                <td>
                                    {step.type && (
                                        <StepContent type={step.type} content={step.content} />
                                    )}
                                </td>
                                <td>
                                    <div className="flex gap-2 items-center justify-between w-full">
                                        {!(isLoading || !edit) ? (
                                            <div className="flex gap-1">
                                                <button
                                                    className="btn btn-sm btn-ghost"
                                                    onClick={(e) => editSteps(e, step)}
                                                >
                                                    <Icons.edit size={16} />
                                                    编辑
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-ghost"
                                                    onClick={(e) => removeSteps(e, step)}
                                                >
                                                    <Icons.delete size={16} />
                                                    移除
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                {/* <button
                                                className="btn btn-sm btn-ghost"
                                                onClick={(e) =>
                                                    previewSteps(e)
                                                }
                                            >
                                                <Icons.preview
                                                    size={16}
                                                />
                                                查看
                                            </button> */}
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </>
            ) : (
                <div>当前暂无步骤，请手动添加</div>
            )}
        </>
    );
}

const StepType = ({ type }: { type: number }) => {
    switch (type) {
        case 1:
            return <span className="badge badge-outline">仅文字</span>;
        case 2:
            return <span className="badge badge-outline">左侧图片</span>;
        case 3:
            return <span className="badge badge-outline">右侧图片</span>;
        case 4:
            return <span className="badge badge-outline">写作实验</span>;
        case 5:
            return <span className="badge badge-outline">跳转服务</span>;
        case 6:
            return <span className="badge badge-outline">表单</span>;
        default:
            return <span className="badge badge-outline">仅文字</span>;
    }
};

const StepContent = ({ type, content }: { type?: number; content: any }) => {
    switch (type) {
        case 1:
            return <></>;
        case 2:
            return <></>;
        case 3:
            return <></>;
        case 4:
            return (
                <div className="flex flex-col gap-2">
                    <div>
                        实验时长：{content.countdown > 0 ? `${content.countdown}分钟` : '不限时'}
                    </div>
                    <div>开启图片：{content.pic_mode ? '开启' : '无图'}</div>
                </div>
            );
        case 5:
            return <div>跳转地址：{content?.redirect_url ? '已配置' : '未配置'}</div>;
        case 6:
            return <span className="badge badge-outline">表单</span>;
        default:
            return <span className="badge badge-outline">仅文字</span>;
    }
};
