'use client';

import { useRouter } from 'next/navigation';

interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
    path?: string;
    current: number;
    pageSize?: number;
    end?: number;
}

export default function Pagination({ current, pageSize = 10, end = 1 }: PaginationProps) {
    const router = useRouter();

    const jumpTo = (i: number) => {
        const searchParams = new URLSearchParams(window.location.search);

        // 设置或更新页码和页面大小参数
        searchParams.set('page', i.toString());
        searchParams.set('pagesize', pageSize.toString());
        const pathname = window.location.pathname;
        // 构造新的URL，保留现有的查询参数
        const newUrl = `${pathname}?${searchParams.toString()}`;
        router.push(newUrl);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const searchParams = new URLSearchParams(window.location.search);

        // 设置或更新页码和页面大小参数
        searchParams.set('page', current.toString());
        searchParams.set('pagesize', e.target.value);
        const pathname = window.location.pathname;
        // 构造新的URL，保留现有的查询参数
        const newUrl = `${pathname}?${searchParams.toString()}`;
        router.push(newUrl);
    };

    return (
        <div className="flex gap-2">
            <div>
                <select
                    className="select select-bordered w-full max-w-xs"
                    onChange={(e) => handlePageSizeChange(e)}
                    value={pageSize}
                >
                    <option value={10}>10/页</option>
                    <option value={25}>25/页</option>
                    <option value={50}>50/页</option>
                </select>
            </div>
            <div className="join">
                <div className="join grid grid-cols-3 items-center">
                    <button
                        className="join-item btn btn-outline"
                        data-page={Math.max(1, current - 1)}
                        onClick={() => jumpTo(Math.max(1, current - 1))}
                    >
                        前一页
                    </button>
                    <div className="join-item text-center text-sm"> 第 {current} 页</div>
                    <button
                        className="join-item btn btn-outline"
                        data-page={Math.max(1, current + 1)}
                        onClick={() => jumpTo(Math.min(end, current + 1))}
                    >
                        下一页
                    </button>
                </div>
            </div>
        </div>
    );
}
