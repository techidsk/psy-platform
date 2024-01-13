'use client';

import { useRouter } from 'next/navigation';

interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
    path: string;
    current: number;
    pageSize?: number;
    end?: number;
}

export default function Pagination({
    path,
    children,
    current,
    pageSize = 10,
    end = 1,
}: PaginationProps) {
    const router = useRouter();

    const jumpTo = (i: number) => {
        const searchParams = new URLSearchParams(window.location.search);

        // 设置或更新页码和页面大小参数
        searchParams.set('page', i.toString());
        searchParams.set('pagesize', pageSize.toString());

        // 构造新的URL，保留现有的查询参数
        const newUrl = `${path}?${searchParams.toString()}`;
        router.push(newUrl);
    };

    return (
        <div className="join">
            <div className="join grid grid-cols-2">
                <button
                    className="join-item btn btn-outline"
                    data-page={Math.max(1, current - 1)}
                    onClick={() => jumpTo(Math.max(1, current - 1))}
                >
                    前一页
                </button>
                <button
                    className="join-item btn btn-outline"
                    data-page={Math.max(1, current + 1)}
                    onClick={() => jumpTo(Math.min(end, current + 1))}
                >
                    下一页
                </button>
            </div>
        </div>
    );
}
