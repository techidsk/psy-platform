'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { zhCN } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { projectFormSchema } from '@/lib/validations/project';
import { getUrl } from '@/lib/url';
import { Icons } from '@/components/icons';
import { DatePickerComponent } from '@/components/datepicker/datepicker';
import { projects, project_group } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { useTableState } from '@/state/_table_atom';
interface ProjectFormProps extends React.HTMLAttributes<HTMLDivElement> {
    closeModal?: Function;
    edit?: boolean;
    nano_id?: string;
    project?: projects;
    projectGroups?: project_group[];
    projectGroupsIds?: number[];
}
type FormData = z.infer<typeof projectFormSchema>;

export function ProjectCreateForm({
    className,
    nano_id: id,
    closeModal,
    edit,
    project,
    projectGroups,
    projectGroupsIds,
    ...props
}: ProjectFormProps) {
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
    const router = useRouter();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(dayjs().add(1, 'day').toDate());

    const setSelectIds = useTableState((state) => state.setSelectIds);
    const itemName = 'project-group-ids';

    // 创建项目
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

    function addProjectGroups(event: any, engines: JsonValue | undefined) {
        event.preventDefault();
        // TODO 添加实验
        const enginesArray = engines as number[];
        setSelectIds(enginesArray, itemName);
        router.push('/project/group');
    }

    function showProjectGroup(event: any, id: number) {
        event.preventDefault();
        router.push(`/project/group/${id}`);
    }

    function removeGroupFromProject(event: any, id: number) {
        event.preventDefault();
        console.log('remove experiment', id);
    }

    /**
     * 创建项目
     * @param data
     * @returns
     */
    async function onSubmit(data: FormData) {
        console.log(data);

        if (isLoading) {
            return;
        }

        setIsLoading(true);
        await addProject(data);
        setIsLoading(false);
    }

    function initForm() {
        if (project) {
            setValue('project_name', project.project_name || '');
            setValue('project_description', project.project_description || '');
            setStartDate(project.start_time || new Date());
            setEndDate(project.end_time || new Date());
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
                <div className="grid gap-4">
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="project_name">
                            项目名称
                        </label>
                        <input
                            nano_id="project_name"
                            placeholder="请输入项目名称"
                            type="text"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading || !edit}
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
                            nano_id="project_description"
                            placeholder="请输入项目描述"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading || !edit}
                            className="textarea textarea-bordered w-full"
                            {...register('project_description')}
                        />
                        {errors?.project_description && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.project_description.message}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <div className="flex gap-2 items-center">
                            <label className="flex items-center" htmlFor="start_time">
                                项目开始时间
                            </label>
                            <input
                                disabled={true}
                                className="input input-bordered input-sm"
                                value={format(startDate, 'PP', { locale: zhCN })}
                                onChange={(e) => {}}
                            />
                            {edit && (
                                <details className="dropdown dropdown-end">
                                    <summary className="m-1 btn btn-sm">选择开始日期</summary>
                                    <div className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-[320px]">
                                        <DatePickerComponent
                                            selected={startDate}
                                            setSelected={(day: Date | undefined) =>
                                                pickStartDate(day)
                                            }
                                        />
                                    </div>
                                </details>
                            )}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex gap-2 items-center">
                            <label className="flex items-center" htmlFor="end_time">
                                项目结束时间
                            </label>
                            <input
                                disabled={true}
                                className="input input-bordered input-sm"
                                value={format(endDate, 'PP', { locale: zhCN })}
                                onChange={() => {}}
                            />
                            {edit && (
                                <details className="dropdown dropdown-end">
                                    <summary className="m-1 btn btn-sm">选择结束日期</summary>
                                    <div className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-[320px]">
                                        <DatePickerComponent
                                            selected={startDate}
                                            setSelected={(day: Date | undefined) =>
                                                pickEndDate(day)
                                            }
                                        />
                                    </div>
                                </details>
                            )}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex gap-2 items-center">
                            <label className="" htmlFor="project_groups">
                                项目包含分组
                            </label>
                            {edit && (
                                <div className="flex">
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={(e) => addProjectGroups(e, projectGroupsIds)}
                                    >
                                        <Icons.add />
                                        添加
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-4 flex-wrap">
                            {projectGroups && projectGroups.length > 0 ? (
                                projectGroups?.map((group, i) => (
                                    <div className="stats shadow" key={i}>
                                        <div className="p-4 px-6 rounded-xs flex flex-col gap-2">
                                            <div className="stat-title">{group.group_name}</div>
                                            <div className="stat-desc">{group.description}</div>
                                            <div className="flex justify-end mt-2 gap-2">
                                                <button
                                                    className="btn btn-xs"
                                                    onClick={(e) => showProjectGroup(e, group.id)}
                                                >
                                                    <Icons.link size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-xs"
                                                    onClick={(e) => removeGroupFromProject(e, i)}
                                                >
                                                    <Icons.delete size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <span className="badge">暂无分组</span>
                            )}
                        </div>
                    </div>
                    {edit && (
                        <div className="flex justify-end">
                            <button
                                className="btn btn-primary btn-sm"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Icons.save />
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
