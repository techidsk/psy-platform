'use client';
// 删除用户实验记录按钮

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { Icons } from '@/components/icons';
import { toast } from '@/hooks/use-toast';
import { getUrl } from '@/lib/url';

interface HistoryExperimentDeleteButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    userExperimentId: number; // Assuming the ID from user_experiments table
}

export function HistoryExperimentDeleteButton({
    userExperimentId,
}: HistoryExperimentDeleteButtonProps) {
    const [openDelete, setOpenDelete] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    function handleDeleteToggle() {
        if (isLoading) return;
        setOpenDelete(!openDelete);
    }

    async function deleteUserExperiment() {
        setIsLoading(true);
        try {
            const response = await fetch(getUrl('/api/history/delete'), {
                // Assuming this is the delete endpoint
                method: 'POST', // Or DELETE, depending on API design
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: userExperimentId, // Send the user_experiments ID
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete user experiment');
            }

            toast({
                title: '成功',
                description: '用户实验记录已删除。',
                variant: 'default',
            });
            setOpenDelete(false);
            router.refresh(); // Refresh the page to show updated list
        } catch (error) {
            console.error('Error deleting user experiment:', error);
            toast({
                title: '错误',
                description: '删除用户实验记录失败，请稍后重试。',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <button
                className="btn btn-outline btn-error btn-sm"
                onClick={handleDeleteToggle}
                disabled={isLoading}
            >
                <Icons.delete size={16} />
                删除
            </button>

            <Modal
                className="flex flex-col gap-4 p-4"
                open={openDelete}
                onClose={handleDeleteToggle}
                disableClickOutside={!openDelete}
            >
                <h1 className="text-xl font-semibold">确认删除</h1>
                <p>您确定要删除这条用户实验记录吗？此操作无法撤销。</p>
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        className="btn btn-ghost"
                        onClick={handleDeleteToggle}
                        disabled={isLoading}
                    >
                        取消
                    </button>
                    <button
                        className={`btn btn-error ${isLoading ? 'loading' : ''}`}
                        onClick={deleteUserExperiment}
                        disabled={isLoading}
                    >
                        {isLoading ? '删除中...' : '确认删除'}
                    </button>
                </div>
            </Modal>
        </>
    );
}
