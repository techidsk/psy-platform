'use client';

import { useEffect } from 'react';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { getUrl } from '@/lib/url';
import { toast } from '@/hooks/use-toast';

interface EngineFormProps extends React.HTMLAttributes<HTMLDivElement> {
    closeModal: Function;
    engineId?: number;
}

export function EngineDeleteModal({ className, closeModal, engineId, ...props }: EngineFormProps) {
    async function deleteUser() {
        try {
            const response = await fetch(getUrl(`/api/engine/${engineId}`), {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                // 处理错误响应
                const errorData = await response.json();
                console.error('删除失败:', errorData);
                return { success: false, message: errorData.message || '删除失败' };
            }

            toast({
                title: '删除成功',
                description: '已成功删除引擎',
                duration: 3000,
            });
            closeModal();
        } catch (error) {
            toast({
                title: '删除失败',
                description: '网络错误或服务器无法响应',
                variant: 'destructive',
                duration: 5000,
            });
        }
    }

    function close() {
        closeModal();
    }

    return (
        <div className={cn('grid gap-6', className)} {...props}>
            <div className="text-lg flex gap-2 text-red-500">
                <Icons.alert /> 是否确认删除引擎?
            </div>
            <div className="flex justify-end gap-4">
                <button className="btn btn-primary" onClick={deleteUser}>
                    删除
                </button>
                <button className="btn" onClick={close}>
                    取消
                </button>
            </div>
        </div>
    );
}
