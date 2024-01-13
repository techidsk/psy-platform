'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { useTableState } from '@/state/_table_atom';

interface ExperimentTableConfirmButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    itemName: string;
}

export function ExperimentTableConfirmButton({
    className,
    itemName,
    ...props
}: ExperimentTableConfirmButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const selectedIds = useTableState((state) => state.selectedIds);
    const reset = useTableState((state) => state.resetIds);

    function resetSelected() {
        reset(itemName);
    }

    /**
     * 确认项目关联实验
     */
    async function onClick() {
        console.log(selectedIds);
        console.log(selectedIds[itemName] || []);
    }

    return (
        <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm" onClick={resetSelected}>
                <Icons.rotate />
                重置选择
            </button>
            <button
                onClick={onClick}
                className={cn(
                    {
                        'cursor-not-allowed opacity-60': isLoading,
                    },
                    className
                )}
                disabled={isLoading}
                {...props}
            >
                {isLoading ? (
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                ) : (
                    <Icons.add className="h-4 w-4" />
                )}
                确定关联
            </button>
        </div>
    );
}
