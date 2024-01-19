'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

interface ExperimentEditButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    edit: boolean;
}

/**
 * 创建项目
 *
 * @param param0
 * @returns
 */
export function ExperimentEditButton({ className, edit, ...props }: ExperimentEditButtonProps) {
    const router = useRouter();

    function onClick() {
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
