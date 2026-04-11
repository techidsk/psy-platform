'use client';

import { useRouter } from 'next/navigation';
import { Icons } from './icons';

interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
    current: number;
    pageSize?: number;
    /** 旧模式：推断的最后可达页码 */
    end?: number;
    /** 新模式：总记录数，传入后启用完整分页 */
    total?: number;
    /** 新模式：页码变化回调，不传则走 URL 翻页 */
    onPageChange?: (page: number) => void;
    /** 新模式：pageSize 变化回调 */
    onPageSizeChange?: (size: number) => void;
}

/**
 * 生成 Semi Design 风格的页码序列
 * 例: 总8页，当前第1页 => [1, 2, 3, 4, '...', 7, 8]
 * 例: 总8页，当前第5页 => [1, 2, '...', 4, 5, 6, '...', 7, 8]
 * 例: 总8页，当前第7页 => [1, 2, '...', 5, 6, 7, 8]
 */
function buildPageList(current: number, totalPages: number): (number | '...')[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [];

    // 始终显示前两页
    pages.push(1, 2);

    // 当前页附近的范围（current-1, current, current+1）
    const rangeStart = Math.max(3, current - 1);
    const rangeEnd = Math.min(totalPages - 2, current + 1);

    // 左侧省略号
    if (rangeStart > 3) {
        pages.push('...');
    }

    // 中间页码
    for (let i = rangeStart; i <= rangeEnd; i++) {
        pages.push(i);
    }

    // 右侧省略号
    if (rangeEnd < totalPages - 2) {
        pages.push('...');
    }

    // 始终显示后两页
    pages.push(totalPages - 1, totalPages);

    return pages;
}

export default function Pagination({
    current,
    pageSize = 10,
    end = 1,
    total,
    onPageChange,
    onPageSizeChange,
}: PaginationProps) {
    const router = useRouter();
    const isCallbackMode = typeof onPageChange === 'function';
    const totalPages = total !== undefined ? Math.max(1, Math.ceil(total / pageSize)) : end;

    const jumpTo = (page: number) => {
        const target = Math.max(1, Math.min(page, totalPages));
        if (target === current) return;

        if (isCallbackMode) {
            onPageChange(target);
        } else {
            const searchParams = new URLSearchParams(window.location.search);
            searchParams.set('page', target.toString());
            searchParams.set('pagesize', pageSize.toString());
            const pathname = window.location.pathname;
            router.push(`${pathname}?${searchParams.toString()}`);
        }
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = parseInt(e.target.value);
        if (isCallbackMode && onPageSizeChange) {
            onPageSizeChange(newSize);
        } else {
            const searchParams = new URLSearchParams(window.location.search);
            searchParams.set('page', '1');
            searchParams.set('pagesize', newSize.toString());
            const pathname = window.location.pathname;
            router.push(`${pathname}?${searchParams.toString()}`);
        }
    };

    const isFirstPage = current <= 1;
    const isLastPage = total !== undefined ? current >= totalPages : current >= end;

    // 新模式：Semi 风格页码列表
    if (total !== undefined) {
        const pageList = buildPageList(current, totalPages);

        return (
            <div className="flex items-center gap-2">
                <select
                    className="select select-sm w-auto"
                    onChange={handlePageSizeChange}
                    value={pageSize}
                >
                    <option value={10}>10/页</option>
                    <option value={25}>25/页</option>
                    <option value={50}>50/页</option>
                </select>

                <span className="text-sm text-base-content/60">共 {total} 条</span>

                <div className="join">
                    {/* 上一页 */}
                    <button
                        className="join-item btn btn-sm"
                        disabled={isFirstPage}
                        onClick={() => jumpTo(current - 1)}
                        aria-label="Previous"
                    >
                        <Icons.chevronLeft className="w-4 h-4" />
                    </button>

                    {/* 页码 + 省略号 */}
                    {pageList.map((item, idx) =>
                        item === '...' ? (
                            <button
                                key={`ellipsis-${idx}`}
                                className="join-item btn btn-sm btn-disabled"
                                aria-label="More"
                                tabIndex={-1}
                            >
                                ...
                            </button>
                        ) : (
                            <button
                                key={item}
                                className={`join-item btn btn-sm ${item === current ? 'btn-active' : ''}`}
                                onClick={() => jumpTo(item)}
                                aria-label={`Page ${item}`}
                                aria-current={item === current ? 'page' : 'false'}
                            >
                                {item}
                            </button>
                        )
                    )}

                    {/* 下一页 */}
                    <button
                        className="join-item btn btn-sm"
                        disabled={isLastPage}
                        onClick={() => jumpTo(current + 1)}
                        aria-label="Next"
                    >
                        <Icons.chevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    // 旧模式：仅上一页/下一页
    return (
        <div className="flex gap-2">
            <div>
                <select
                    className="select w-full max-w-xs"
                    onChange={handlePageSizeChange}
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
                        className="join-item btn"
                        onClick={() => jumpTo(Math.max(1, current - 1))}
                    >
                        <Icons.chevronLeft className="w-4 h-4" />
                    </button>
                    <div className="join-item btn text-center text-sm">第 {current} 页</div>
                    <button
                        className="join-item btn"
                        onClick={() => jumpTo(Math.min(end, current + 1))}
                    >
                        <Icons.chevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
