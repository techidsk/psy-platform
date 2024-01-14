'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

interface CreateProjectGroupButtonProps extends React.HTMLAttributes<HTMLButtonElement> {}

/**
 * 创建项目
 *
 * @param param0
 * @returns
 */
export function CreateProjectGroupButton({ className, ...props }: CreateProjectGroupButtonProps) {
    const router = useRouter();

    function onClick() {
        router.push(`/project/group/add`);
    }

    return (
        <>
            <button onClick={onClick} className={cn(className)} {...props}>
                <Icons.add className="h-4 w-4" />
                创建
            </button>
        </>
    );
}
