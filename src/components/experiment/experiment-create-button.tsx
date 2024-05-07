'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

interface ExperimentCreateButtonProps extends React.HTMLAttributes<HTMLButtonElement> {}

export function ExperimentCreateButton({ className, ...props }: ExperimentCreateButtonProps) {
    const router = useRouter();

    function onClick() {
        router.push(`/experiment/add/`);
    }

    return (
        <button onClick={onClick} className={cn(className)} {...props}>
            <Icons.add className="h-4 w-4" />
            创建
        </button>
    );
}
