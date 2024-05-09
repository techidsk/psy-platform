'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { Modal } from '@/components/ui/modal';
import { ProjectDeleteModal } from './project-group-delete-modal';

interface ProjectGroupTableEditButtonsProps extends React.HTMLAttributes<HTMLButtonElement> {
    groupId: number;
}

/**
 * 编辑用户，管理员有权限创建学生管理
 *
 * @param param0
 * @returns
 */
export function ProjectGroupTableEditButtons({
    className,
    groupId,
    ...props
}: ProjectGroupTableEditButtonsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [openDelete, setOpenDelete] = useState(false);

    async function showProject() {
        router.push(`/project/group/${groupId}`);
    }

    async function editProject() {
        router.push(`/project/group/${groupId}?edit=true`);
    }

    function deleteUser() {
        setOpenDelete(true);
    }

    function handleDeleteToggle() {
        setOpenDelete(!openDelete);
        setIsLoading(!isLoading);
    }

    function closeDeleteModal() {
        setOpenDelete(false);
        setIsLoading(false);
        router.refresh();
    }

    return (
        <>
            {/* <button
                className={cn(
                    {
                        'cursor-not-allowed opacity-60': isLoading,
                    },
                    'btn btn-ghost btn-sm',
                    className
                )}
                onClick={showProject}
            >
                <Icons.list className="h-4 w-4" />
                查看详情
            </button> */}
            <button
                className={cn(
                    {
                        'cursor-not-allowed opacity-60': isLoading,
                    },
                    'btn btn-ghost btn-sm',
                    className
                )}
                onClick={editProject}
            >
                <Icons.edit className="h-4 w-4" />
                编辑
            </button>
            <button
                className={cn(
                    {
                        'cursor-not-allowed opacity-60': isLoading,
                    },
                    'btn btn-ghost btn-sm',
                    className
                )}
                onClick={deleteUser}
            >
                <Icons.delete className="h-4 w-4" />
                删除
            </button>
            {openDelete && (
                <Modal
                    className="flex flex-col gap-4"
                    open={openDelete}
                    onClose={handleDeleteToggle}
                    disableClickOutside={!openDelete}
                >
                    <h1 className="text-xl">删除项目</h1>
                    <ProjectDeleteModal closeModal={closeDeleteModal} projectId={groupId} />
                </Modal>
            )}
        </>
    );
}
