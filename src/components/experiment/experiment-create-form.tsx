'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { exprimentSchema, exprimentStepSchema } from '@/lib/validations/experiment';
import { Icons } from '@/components/icons';
import { getUrl } from '@/lib/url';

import type { experiment, experiment_steps, engine as experimentEngine } from '@prisma/client';
import Image from 'next/image';
import { Modal } from '../ui/modal';

interface ExperimentCreateFormProps extends React.HTMLAttributes<HTMLDivElement> {
    experiment: experiment | null;
    nano_id: string;
    edit?: boolean;
    engines?: experimentEngine[] | null;
    steps?: experiment_steps[] | null;
}

type FormData = z.infer<typeof exprimentSchema>;
type StepFormData = z.infer<typeof exprimentStepSchema>;

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
    const {
        register: stepRegister,
        handleSubmit: stepHandleSubmit,
        formState: { errors: stepErrors },
        reset: stepReset,
        setValue: stepSetValue,
    } = useForm<StepFormData>({
        resolver: zodResolver(exprimentStepSchema),
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [engineId, setEngineId] = useState<number>(0);
    const [dispatch, setDispatch] = useState<string>('CREATE');
    const [experimentSteps, setExperimentSteps] = useState<any[]>([]);

    const [openStepForm, setOpenStepForm] = useState<boolean>(false);
    const [stepType, setStepType] = useState<number>(0);
    const [addtionalSteps, setAddtionalSteps] = useState<any[]>([]);

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
                    steps: [...experimentSteps, ...addtionalSteps],
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
                    steps: addtionalSteps,
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
        setOpenStepForm(true);
        stepReset();
        setStepType(0);
        stepSetValue('type', 0);
    };

    const editSteps = (e: any) => {
        e.preventDefault();
    };

    const previewSteps = (e: any) => {
        e.preventDefault();
    };

    const updateStepType = (stepType: number) => {
        setStepType(stepType);
        stepSetValue('type', stepType);
    };

    const addExperimentStep = (data: any) => {
        console.log(data, experiment?.id);

        setAddtionalSteps([...addtionalSteps, data]);
        setOpenStepForm(false);

        setExperimentSteps([...experimentSteps, data]);
    };

    function initForm() {
        if (experiment) {
            setValue('experiment_name', experiment.experiment_name || '');
            setValue('description', experiment.description || '');
            setValue('intro', experiment.intro || '');
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
                                                defaultValue={engine.engine_name}
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
            {openStepForm && (
                <Modal
                    className="flex flex-col gap-4"
                    open={openStepForm}
                    onClose={() => setOpenStepForm(false)}
                    disableClickOutside={!open}
                >
                    <h3 className="font-bold text-lg">实验内设置</h3>
                    <form onSubmit={stepHandleSubmit(addExperimentStep)}>
                        <div className="grid gap-2">
                            <div className="grid gap-1">
                                <label className="sr-only" htmlFor="step_type">
                                    步骤样式
                                </label>
                                <div className="flex gap-2">
                                    {stepTypes.map((type) => {
                                        return (
                                            <div key={type.id} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    className="radio"
                                                    defaultValue={type.id}
                                                    checked={type.id === stepType}
                                                    disabled={isLoading || !edit}
                                                    onClick={() => updateStepType(type.id)}
                                                />
                                                <label htmlFor={type.name}>{type.name}</label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="grid gap-1">
                                <label className="sr-only" htmlFor="step_name">
                                    步骤名称
                                </label>
                                <input
                                    data-name="step_name"
                                    placeholder="请输入步骤名称"
                                    type="text"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    className="input input-bordered w-full"
                                    {...stepRegister('step_name')}
                                />
                                {stepErrors?.step_name && (
                                    <p className="px-1 text-xs text-red-600">
                                        {stepErrors.step_name.message}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-1">
                                <label className="sr-only" htmlFor="title">
                                    标题
                                </label>
                                <input
                                    data-name="title"
                                    placeholder="请输入步骤标题"
                                    type="text"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    className="input input-bordered w-full"
                                    {...stepRegister('title')}
                                />
                                {stepErrors?.title && (
                                    <p className="px-1 text-xs text-red-600">
                                        {stepErrors.title.message}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-1">
                                <label className="sr-only" htmlFor="step_content">
                                    内容
                                </label>
                                <textarea
                                    data-name="step_content"
                                    placeholder="请输入显示内容"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    className="textarea textarea-bordered w-full"
                                    rows={5}
                                    {...stepRegister('step_content')}
                                />
                                {stepErrors?.step_content && (
                                    <p className="px-1 text-xs text-red-600">
                                        {stepErrors.step_content.message}
                                    </p>
                                )}
                            </div>
                            {stepTypes.find((type) => type.id === stepType && type.image) && (
                                <div className="grid gap-1">
                                    <label className="sr-only" htmlFor="step_image">
                                        上传图片
                                    </label>
                                    <input
                                        type="file"
                                        className="file-input file-input-bordered w-full max-w-xs"
                                        placeholder="请上传图片"
                                    />
                                </div>
                            )}
                            <div className="flex flex-row-reverse gap-2">
                                <button className="btn btn-ghost btn-outline" type="submit">
                                    <Icons.add />
                                    添加
                                </button>
                            </div>
                        </div>
                    </form>
                </Modal>
            )}
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

const stepTypes = [
    {
        id: 1,
        name: '仅图文',
        image: false,
    },
    {
        id: 2,
        name: '左侧图片',
        image: true,
    },
    {
        id: 3,
        name: '右侧图片',
        image: true,
    },
];
