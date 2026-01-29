'use client';

import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';

interface TableSortButtonProps {
    sortKey: string;
    currentSortBy?: string;
    currentSortOrder?: 'asc' | 'desc';
    children: React.ReactNode;
}

export function TableSortButton({
    sortKey,
    currentSortBy,
    currentSortOrder = 'desc',
    children,
}: TableSortButtonProps) {
    const router = useRouter();
    const isActive = currentSortBy === sortKey;
    const nextOrder = isActive && currentSortOrder === 'desc' ? 'asc' : 'desc';

    const handleSort = () => {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set('sort_by', sortKey);
        searchParams.set('sort_order', nextOrder);
        // 排序时重置页码
        searchParams.set('page', '1');

        const pathname = window.location.pathname;
        const newUrl = `${pathname}?${searchParams.toString()}`;
        router.push(newUrl);
    };

    return (
        <button
            onClick={handleSort}
            className="flex items-center gap-1 hover:text-primary transition-colors group"
        >
            <span>{children}</span>
            <span className="flex flex-col">
                {isActive ? (
                    currentSortOrder === 'asc' ? (
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
