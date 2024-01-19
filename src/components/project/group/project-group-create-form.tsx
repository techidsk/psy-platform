'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { projectGroupFormSchema } from '@/lib/validations/project-group';
import { Icons } from '@/components/icons';
import { getUrl } from '@/lib/url';
import { useRouter } from 'next/navigation';
import { experiment, project_group } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';
import { useTableState } from '@/state/_table_atom';
import { NoAuthTable, Table } from '@/components/table/table';
import { TableConfig } from '@/types/table';
interface ProjectGroupFormProps extends React.HTMLAttributes<HTMLDivElement> {
    closeModal?: Function;
    edit?: boolean;
    nano_id?: string;
    projectGroup?: project_group;
    experiments?: experiment[];
}
type FormData = z.infer<typeof projectGroupFormSchema>;
const itemName = 'project-group-add-experiment';

export function ProjectGroupCreateForm({
    className,
    nano_id: id,
    closeModal,
    edit,
    projectGroup,
    experiments,
    ...props
}: ProjectGroupFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<FormData>({
        resolver: zodResolver(projectGroupFormSchema),
        defaultValues: {
            group_name: '',
            description: '',
        },
    });
    const router = useRouter();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dispatch, setDispatch] = useState<string>('CREATE');

    const setSelectIds = useTableState((state) => state.setSelectIds);

    // 创建项目
    async function addProjectGroup(data: FormData) {
        try {
            const result = await fetch(getUrl('/api/project/group/add'), {
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

    async function patchProjectGroup(data: FormData) {
        try {
            const result = await fetch(getUrl('/api/project/group/patch'), {
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
                    description: responseBody.msg || '已成功更新新项目分组',
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

    function addProjectGroups(event: any, engines: JsonValue | undefined) {
        event.preventDefault();
        // TODO 添加实验
        // const enginesArray = engines as number[];
        // setSelectIds(enginesArray, itemName);
        router.push(`/project/experiment`);
    }

    function showProjectGroup(event: any, id: number) {
        event.preventDefault();
        console.log('show experiment', id);
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
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        if (dispatch === 'UPDATE') {
            // TODO 更新项目
            await patchProjectGroup(data);
        } else {
            await addProjectGroup(data);
        }
        setIsLoading(false);
    }

    function initForm() {
        if (projectGroup) {
            setValue('group_name', projectGroup.group_name || '');
            setValue('description', projectGroup.description || '');
        }
    }

    useEffect(() => {
        console.log(experiments, projectGroup);
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
                        <label className="sr-only" htmlFor="group_name">
                            项目名称
                        </label>
                        <input
                            data-name="group_name"
                            placeholder="请输入项目分组名称"
                            type="text"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading || !edit}
                            className="input input-bordered w-full"
                            {...register('group_name')}
                        />
                        {errors?.group_name && (
                            <p className="px-1 text-xs text-red-600">{errors.group_name.message}</p>
                        )}
                    </div>
                    <div className="grid gap-1">
                        <label className="sr-only" htmlFor="description">
                            项目描述
                        </label>
                        <textarea
                            data-name="description"
                            placeholder="请输入项目分组描述"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading || !edit}
                            className="textarea textarea-bordered w-full"
                            {...register('description')}
                        />
                        {errors?.description && (
                            <p className="px-1 text-xs text-red-600">
                                {errors.description.message}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <div className="flex gap-2 items-center">
                            <label className="" htmlFor="project_groups">
                                分组实验列表
                            </label>
                            {edit && (
                                <div className="flex">
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={(e) =>
                                            addProjectGroups(e, experiments?.map((e) => e.id))
                                        }
                                    >
                                        <Icons.add />
                                        添加
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-4 flex-wrap">
                            {experiments && experiments.length > 0 ? (
                                <div className="w-full overflow-auto">
                                    <NoAuthTable
                                        configs={groupExperimentConfig}
                                        datas={experiments}
                                    />
                                </div>
                            ) : (
                                <span className="badge">暂无实验</span>
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

const groupExperimentConfig: TableConfig[] = [
    {
        key: 'experiment_name',
        label: '实验名称',
        children: (data: any) => <span>{data.experiment_name}</span>,
    },
    {
        key: 'description',
        label: '实验描述',
        children: (data: any) => <span>{data.description}</span>,
    },
    {
        key: 'intro',
        label: '介绍',
        children: (data: any) => <span>{data.intro}</span>,
    },
    {
        key: 'engine_image',
        label: '引擎',
        children: (data: any) => (
            <div className="flex flex-col gap-2">
                {data.engine_name ? (
                    <div className="flex gap-2 items-center">
                        <Image
                            className="rounded"
                            src={data.engine_image}
                            alt={data.engine_name}
                            width={36}
                            height={36}
                        />
                        <span>{data.engine_name}</span>
                    </div>
                ) : (
                    <span>无</span>
                )}
            </div>
        ),
    },
];
