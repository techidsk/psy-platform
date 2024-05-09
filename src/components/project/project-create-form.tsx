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
import { useProjectState } from '@/state/_project_atoms';
import { logger } from '@/lib/logger';
import { getId } from '@/lib/nano-id';

interface ProjectFormProps extends React.HTMLAttributes<HTMLDivElement> {
    closeModal?: Function;
    edit?: boolean;
    nano_id?: string;
    project?: projects;
    projectGroups?: project_group[];
    projectGroupsIds?: number[];
    add?: boolean;
}
type FormData = z.infer<typeof projectFormSchema>;
const itemName = 'project-group-ids';

export function ProjectCreateForm({
    className,
    nano_id: id,
    closeModal,
    edit,
    project,
    projectGroups,
    projectGroupsIds,
    add = false,
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
    const [dispatch, setDispatch] = useState<string>('CREATE');

    const setSelectIds = useTableState((state) => state.setSelectIds);
    const setProjectId = useProjectState((state) => state.setProjectId);

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

    async function patchProject(data: FormData) {
        try {
            const result = await fetch(getUrl(`/api/project/patch`), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                }),
            });
            const responseBody = await result.json();
            if (result.ok) {
                toast({
                    title: '更新成功',
                    description: responseBody.msg || '已成功更新项目',
                    duration: 3000,
                });
                if (closeModal) {
                    closeModal();
                }
            } else {
                toast({
                    title: '更新失败',
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

    // 添加项目分组
    function addProjectGroups(event: any, projectGroupsIds: JsonValue | undefined) {
        event.preventDefault();
        const projectGroupsIdsArray = projectGroupsIds as number[];
        setSelectIds(projectGroupsIdsArray, itemName);
        // 添加ProjectId
        setProjectId(project?.id);
        router.push('/project/group');
    }

    function showProjectGroup(event: any, id: number) {
        event.preventDefault();
        router.push(`/project/group/${id}`);
    }

    async function removeGroupFromProject(event: any, id: number) {
        event.preventDefault();
        const response = await fetch(getUrl(`/api/project/group/remove`), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project_id: project?.id,
                group_id: id,
            }),
        });
        const responseBody = await response.json();
        if (response.ok) {
            toast({
                title: '移除成功',
                description: responseBody.msg || '已成功移除分组',
                duration: 3000,
            });
            router.refresh();
        } else {
            toast({
                title: '移除失败',
                description: responseBody.msg || '请查看系统消息',
                variant: 'destructive',
                duration: 5000,
            });
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
        if (dispatch === 'UPDATE') {
            await patchProject({ ...data, id: project?.id });
        } else {
            await addProject(data);
        }
        setIsLoading(false);

        router.back();
        setTimeout(() => {
            router.refresh();
        }, 50);
    }

    function initForm() {
        if (project) {
            setValue('project_name', project.project_name || '');
            setValue('project_description', project.project_description || '');
            setValue('state', project.state || 'AVAILABLE');
            setStartDate(project.start_time || new Date());
            setEndDate(project.end_time || new Date());
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
        initForm();
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
                            data-name="project_name"
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
                            data-name="project_description"
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
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="state">
                            项目状态
                        </label>
                        <select
                            className="select select-bordered w-full max-w-xs"
                            defaultValue={project?.state || 'AVAILABLE'}
                            disabled={isLoading || !edit}
                            {...register('state')}
                        >
                            <option disabled value={''}>
                                请选择项目状态
                            </option>
                            <option value={'AVAILABLE'}>可用</option>
                            <option value={'DRAFT'}>未激活</option>
                            <option value={'ACHIVED'}>已归档</option>
                        </select>
                        {errors?.state && (
                            <p className="px-1 text-xs text-red-600">{errors.state.message}</p>
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
                                            selected={endDate}
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
                                <div className="w-full">
                                    <table className="table">
                                        {/* head */}
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <th>分组名称</th>
                                                <th>分组描述</th>
                                                <th>实验间隔（小时）</th>
                                                <th>操作</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {projectGroups?.map((group, i) => (
                                                <tr key={i}>
                                                    <th>{i + 1}</th>
                                                    <td>{group.group_name}</td>
                                                    <td>{group.description}</td>
                                                    <td>{group.gap}</td>
                                                    <td>
                                                        <div className="flex justify-start gap-2">
                                                            <button
                                                                className="btn btn-sm"
                                                                onClick={(e) =>
                                                                    showProjectGroup(e, group.id)
                                                                }
                                                            >
                                                                <Icons.link size={16} />
                                                                查看分组
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline btn-error"
                                                                onClick={(e) =>
                                                                    removeGroupFromProject(
                                                                        e,
                                                                        group.id
                                                                    )
                                                                }
                                                            >
                                                                <Icons.delete size={16} />
                                                                移除分组
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
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
