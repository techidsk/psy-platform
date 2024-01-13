'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

interface ProjectEditButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    id?: string;
    edit: boolean;
}

/**
 * 创建项目
 *
 * @param param0
 * @returns
 */
export function ProjectEditButton({ className, id, edit, ...props }: ProjectEditButtonProps) {
    const router = useRouter();

    async function onClick() {
        router.push(`/project/${id}?edit=true`);
    }

    return (
        <>
            {!edit && (
                <button onClick={onClick} className={cn(className)} {...props}>
                    <>
                        <Icons.edit className="h-4 w-4" />
                        编辑
                    </>
                </button>
            )}
        </>
    );
}
