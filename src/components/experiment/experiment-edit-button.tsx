'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { toast } from '@/hooks/use-toast';

interface ExperimentEditButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    edit: boolean;
    lock?: boolean;
}

/**
 * 创建项目
 *
 * @param param0
 * @returns
 */
export function ExperimentEditButton({
    className,
    edit,
    lock,
    ...props
}: ExperimentEditButtonProps) {
    const router = useRouter();

    function onClick() {
        if (lock) {
            toast({
                title: '无法编辑',
                description: '当前实验已锁定，请解锁后再编辑',
                variant: 'destructive',
                duration: 3000,
            });
            return;
        }
        router.push(`${window.location.pathname}?edit=true`);
    }

    return (
        <>
            {!edit && (
                <button onClick={onClick} className={cn(className)} {...props}>
                    <Icons.edit className="h-4 w-4" />
                    编辑
                </button>
            )}
        </>
    );
}
