'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { exprimentStepSchema } from '@/lib/validations/experiment';
import { Icons } from '@/components/icons';

import type { experiment_steps } from '@prisma/client';
import { uploadPhotoWithFile } from '@/lib/api/post';
import TiptapEditor from '../editor/tiptap-editor';
import { getUrl } from '@/lib/url';
import { nanoid } from 'nanoid';

interface ExperimentStepFormProps extends React.HTMLAttributes<HTMLDivElement> {
    step?: experiment_steps | null;
    closeModal: Function;
    experimentSteps: any[];
    setExperimentSteps: Function;
}

type FormData = z.infer<typeof exprimentStepSchema>;

export function ExperimentStepForm({
    className,
    step,
    closeModal,
    experimentSteps,
    setExperimentSteps,
    ...props
}: ExperimentStepFormProps) {
    const {
        register: register,
        handleSubmit: handleSubmit,
        formState: { errors: stepErrors },
        reset: reset,
        setValue: setValue,
    } = useForm<FormData>({
        resolver: zodResolver(exprimentStepSchema),
    });

    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [dispatch, setDispatch] = useState<string>('CREATE');

    const [stepContent, setStepContent] = useState<string>('');

    const [stepType, setStepType] = useState<number>(1);
    const [init, setInit] = useState(false);

    const updateStepType = (stepType: number) => {
        setStepType(stepType);
        setValue('type', stepType);
    };

    const updateStepContent = (value: string) => {
        setStepContent(value);
        setValue('step_content', value);
    };

    // 添加实验步骤
    const addExperimentStep = async (data: FormData) => {
        if (data?.step_image) {
            setIsUploading(true);

            const { isFetchSuccess, result } = await uploadPhotoWithFile(data?.step_image[0]);
            data.step_image = isFetchSuccess ? result : '';
        }
        setExperimentSteps([
            ...(experimentSteps || []),
            {
                ...data,
                random_id: nanoid(),
            },
        ]);
        setIsUploading(false);
        closeModal();
    };

    const handleFileChange = async (event: any) => {
        const file = event.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('imageData', file); // 'file' 是用户选择的文件
            const response = await fetch(getUrl('/api/upload/oss'), {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            setValue('step_image', data.url);
        }
    };

    function initForm() {
        if (step) {
            setValue('step_name', step.step_name || '');
            setValue('title', step.title || '');

            setValue('type', step?.type || 1);
            setStepType(step?.type || 1);

            const content = step.content as any;
            setStepContent(content?.content || '');
            setValue('step_image', content?.image || '');
        } else {
            reset();
            //
            setStepType(1);
            setValue('type', 1);
            // 步骤位置选项
            const defaultStepContent = '';
            setStepContent(defaultStepContent);
            setValue('step_content', defaultStepContent);
        }
    }

    useEffect(() => {
        setInit(false);
        initForm();
        setInit(true);
        setDispatch('UPDATE');
    }, []);

    return (
        <>
            <h3 className="font-bold text-lg">实验流程配置</h3>
            {init && (
                <form onSubmit={handleSubmit(addExperimentStep)}>
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
                                                onChange={() => updateStepType(type.id)}
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
                                {...register('step_name')}
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
                                {...register('title')}
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
                            <div className="grid gap-1 border-[1px] border-solid border-neutral-200 rounded-md">
                                <TiptapEditor
                                    placeholder="请输入显示内容"
                                    content={stepContent}
                                    onChange={(value) => updateStepContent(value)}
                                />
                            </div>
                            {stepErrors?.step_content && (
                                <p className="px-1 text-xs text-red-600">
                                    {stepErrors.step_content.message}
                                </p>
                            )}
                        </div>
                        {stepType === 5 && (
                            <div className="grid gap-1">
                                <label className="sr-only" htmlFor="redirect">
                                    跳转地址
                                </label>
                                <input
                                    data-name="redirect"
                                    placeholder="请输入跳转地址"
                                    type="text"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    className="input input-bordered w-full"
                                    {...register('redirect')}
                                />
                            </div>
                        )}
                        {stepTypes.find((type) => type.id === stepType && type.image) && (
                            <div className="grid gap-1">
                                <label className="sr-only" htmlFor="step_image">
                                    上传图片
                                </label>
                                <input
                                    type="file"
                                    accept=".png, .jpg, .jpeg"
                                    className="file-input file-input-bordered w-full max-w-xs"
                                    placeholder="请上传图片"
                                    onChange={(e) => handleFileChange(e)}
                                />
                            </div>
                        )}
                        <div className="flex flex-row-reverse gap-2">
                            <button className="btn btn-outline btn-primary" type="submit">
                                {isUploading ? (
                                    <>
                                        <Icons.spinner className="animate-spin" />
                                        上传图片中...
                                    </>
                                ) : dispatch === 'UPDATE' ? (
                                    <>保存</>
                                ) : (
                                    <>添加</>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </>
    );
}

interface StepTypesProps {
    id: number;
    name: string;
    image: boolean;
    trail?: boolean;
    redirect?: boolean;
}

const stepTypes: StepTypesProps[] = [
    {
        id: 4,
        name: '写作实验',
        trail: true,
        image: false,
    },
    {
        id: 1,
        name: '仅文字',
        trail: false,
        image: false,
    },
    {
        id: 2,
        name: '左侧图片',
        trail: false,
        image: true,
    },
    {
        id: 3,
        name: '右侧图片',
        trail: false,
        image: true,
    },
    {
        id: 5,
        name: '跳转服务',
        trail: false,
        image: false,
        redirect: true,
    },
    {
        id: 6,
        name: '表单',
        trail: false,
        image: false,
        redirect: false,
    },
];
