'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { projectFormSchema } from '@/lib/validations/project';
import { Icons } from '@/components/icons';
import { getUrl } from '@/lib/url';
import { DatePickerComponent } from '../datepicker/datepicker';
import dayjs from 'dayjs';
import { zhCN } from 'date-fns/locale';

interface ProjectAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
    closeModal?: Function;
    edit?: boolean;
    projectId?: number;
    id?: string;
}
type FormData = z.infer<typeof projectFormSchema>;

export function ProjectCreateForm({
    className,
    id,
    closeModal,
    edit,
    projectId,
    ...props
}: ProjectAuthFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<FormData>({
        resolver: zodResolver(projectFormSchema),
        defaultValues: {
            project_name: '',
            project_description: '',
        },
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(dayjs().add(1, 'day').toDate());

    async function addProject(data: FormData) {
        try {
            const result = await fetch(getUrl('/api/project/add'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                }),
            });
            const responseBody = await result.json();
            if (result.ok) {
                toast({
                    title: '创建成功',
                    description: responseBody.msg || '已成功创建新项目',
                    duration: 3000,
                });
                if (closeModal) {
                    closeModal();
                }
            } else {
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

    function pickStartDate(day: Date | undefined) {
        if (day) {
            setStartDate(day);
            setValue('start_time', day);
        }
    }
    function pickEndDate(day: Date | undefined) {
        if (day) {
            setEndDate(day);
            setValue('end_time', day);
        }
    }

    /**
     * 创建项目
     * @param data
     * @returns
     */
    async function onSubmit(data: FormData) {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        await addProject(data);
        setIsLoading(false);
    }

    useEffect(() => {
        reset();
    }, [projectId]);

    return (
        <div className={cn('grid gap-6', className)} {...props}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="project_name">
                            项目名称
                        </label>
                        <input
                            id="project_name"
                            placeholder="请输入项目名称"
                            type="text"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="input input-bordered w-full"
                            {...register('project_name')}
                        />
                        {errors?.project_name && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.project_name.message}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="project_description">
                            项目描述
                        </label>
                        <textarea
                            id="project_description"
                            placeholder="请输入项目描述"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading}
                            className="textarea textarea-bordered w-full"
                            {...register('project_description')}
                        />
                        {errors?.project_description && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.project_description.message}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2 justify-start">
                        <div>
                            <div className="flex justify-between">
                                <div className="flex gap-1">
                                    <label className="px-4" htmlFor="start_time">
                                        项目开始时间 :
                                    </label>
                                    <div>{format(startDate, 'PP', { locale: zhCN })}</div>
                                </div>
                            </div>
                            <DatePickerComponent
                                selected={startDate}
                                setSelected={(day: Date | undefined) => pickStartDate(day)}
                                {...register('start_time')}
                            />
                            {errors?.start_time && (
                                <p className="px-1 text-xs text-red-600">
                                    {errors.start_time.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <div className="flex gap-1">
                                <label className="px-4" htmlFor="end_time">
                                    项目结束时间 :
                                </label>
                                <div>{format(endDate, 'PP', { locale: zhCN })}</div>
                            </div>
                            <DatePickerComponent
                                selected={endDate}
                                setSelected={(day: Date | undefined) => pickEndDate(day)}
                                {...register('end_time')}
                            />
                            {errors?.end_time && (
                                <p className="px-1 text-xs text-red-600">
                                    {errors.end_time.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button className="btn btn-primary" type="submit" disabled={isLoading}>
                            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            创建
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
