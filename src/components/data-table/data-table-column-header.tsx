'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';

interface DataTableColumnHeaderProps {
    title: string;
    sortKey: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export function DataTableColumnHeader({
    title,
    sortKey,
    sortBy,
    sortOrder = 'desc',
}: DataTableColumnHeaderProps) {
    const router = useRouter();
    const currentSearchParams = useSearchParams();
    const pathname = usePathname();
    const isActive = sortBy === sortKey;
    const nextOrder = isActive && sortOrder === 'desc' ? 'asc' : 'desc';

    const handleSort = () => {
        const params = new URLSearchParams(currentSearchParams.toString());
        params.set('sort_by', sortKey);
        params.set('sort_order', nextOrder);
        params.set('page', '1');
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <button
            onClick={handleSort}
            className="flex items-center gap-1 hover:text-primary transition-colors group"
        >
            <span>{title}</span>
            <span className="flex flex-col">
                {isActive ? (
                    sortOrder === 'asc' ? (
                        <Icons.up className="w-3 h-3 text-primary" />
                    ) : (
                        <Icons.down className="w-3 h-3 text-primary" />
                    )
                ) : (
                    <span className="opacity-0 group-hover:opacity-50 transition-opacity">
                        <Icons.down className="w-3 h-3" />
                    </span>
                )}
            </span>
        </button>
    );
}
