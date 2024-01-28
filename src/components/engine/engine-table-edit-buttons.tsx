'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { Modal } from '../ui/modal';
import { EnginePatchForm } from './engine-patch-form';
import { useSession } from 'next-auth/react';
import { EnginePatchAdvancedForm } from './engine-patch-advanced-form';
import { EngineDeleteModal } from './engine-delete-modal';

interface EngineTableEditButtonsProps extends React.HTMLAttributes<HTMLButtonElement> {
    engineId: number;
}

/**
 * 编辑用户，管理员有权限创建学生管理
 *
 * @param param0
 * @returns
 */
export function EngineTableEditButtons({
    className,
    engineId,
    ...props
}: EngineTableEditButtonsProps) {
    const router = useRouter();

    const { data: session, status } = useSession();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    function handleToggle() {
        setOpen(!open);
        setIsLoading(!isLoading);
    }

    function close() {
        console.log('close modal');
        setOpen(false);
        setIsLoading(false);
        router.refresh();
    }

    async function editUser() {
        setOpen(true);
    }

    function deleteEngine() {
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
            <button
                className={cn(
                    {
                        'cursor-not-allowed opacity-60': isLoading,
                    },
                    'btn btn-ghost btn-sm',
                    className
                )}
                onClick={editUser}
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
                onClick={deleteEngine}
            >
                <Icons.delete className="h-4 w-4" />
                删除
            </button>
            {open && (
                <Modal
                    className="flex flex-col gap-4"
                    open={open}
                    onClose={close}
                    disableClickOutside={!open}
                >
                    <h1 className="text-xl">编辑引擎</h1>
                    {session?.user?.role === 'SUPERADMIN' ? (
                        <EnginePatchAdvancedForm
                            closeModal={close}
                            edit={true}
                            engineId={engineId}
                        />
                    ) : (
                        <EnginePatchForm closeModal={close} edit={true} engineId={engineId} />
                    )}
                </Modal>
            )}
            {openDelete && (
                <Modal
                    className="flex flex-col gap-4"
                    open={openDelete}
                    onClose={handleDeleteToggle}
                    disableClickOutside={!openDelete}
                >
                    <h1 className="text-xl">删除引擎</h1>
                    <EngineDeleteModal closeModal={closeDeleteModal} engineId={engineId} />
                </Modal>
            )}
        </>
    );
}
