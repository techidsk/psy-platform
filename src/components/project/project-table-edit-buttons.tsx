'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { Modal } from '../ui/modal';
import { ProjectDeleteModal } from './project-delete-modal';

interface ProjectTableEditButtonsProps extends React.HTMLAttributes<HTMLButtonElement> {
    projectId: number;
}

/**
 * 编辑用户，管理员有权限创建学生管理
 *
 * @param param0
 * @returns
 */
export function ProjectTableEditButtons({
    className,
    projectId,
    ...props
}: ProjectTableEditButtonsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [openDelete, setOpenDelete] = useState(false);

    function showProject() {
        router.push(`/project/${projectId}`);
    }

    function editProject() {
        router.push(`/project/${projectId}?edit=true`);
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
                    { 'cursor-not-allowed opacity-60': isLoading },
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
                    { 'cursor-not-allowed opacity-60': isLoading },
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
                    <ProjectDeleteModal closeModal={closeDeleteModal} projectId={projectId} />
                </Modal>
            )}
        </>
    );
}
