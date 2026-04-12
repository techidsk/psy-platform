'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { Modal } from '../ui/modal';
import { EngineDeleteModal } from './engine-delete-modal';

interface EngineTableEditButtonsProps extends React.HTMLAttributes<HTMLButtonElement> {
    engineId: number;
}

export function EngineTableEditButtons({
    className,
    engineId,
    ...props
}: EngineTableEditButtonsProps) {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [openDelete, setOpenDelete] = useState(false);

    function editEngine() {
        router.push(`/engine/${engineId}`);
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
                onClick={editEngine}
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
