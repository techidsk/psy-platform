'use client';

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    RowSelectionState,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useTableState } from '@/state/_table_atom';

interface DataTableProps<TData> {
    columns: ColumnDef<TData, any>[];
    data: TData[];
    /** 传入后启用行选择，并同步选中 ID 到 Zustand store */
    selectionKey?: string;
    /** 获取行 ID，默认取 (row as any).id */
    getRowId?: (row: TData) => string;
    /** 搜索区域插槽 */
    searchNode?: React.ReactNode;
    /** 分页区域插槽 */
    pagination?: React.ReactNode;
}

export function DataTable<TData>({
    columns,
    data,
    selectionKey,
    getRowId,
    searchNode,
    pagination,
}: DataTableProps<TData>) {
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: !!selectionKey,
        onRowSelectionChange: setRowSelection,
        getRowId: getRowId ?? ((row) => String((row as any).id)),
        state: {
            rowSelection,
        },
    });

    // 同步行选择状态到 Zustand store
    const setSelectIds = useTableState((state) => state.setSelectIds);
    useEffect(() => {
        if (!selectionKey) return;
        const selectedRows = table.getSelectedRowModel().rows;
        const ids = selectedRows.map((row) => Number(row.id));
        setSelectIds(ids, selectionKey);
    }, [rowSelection, selectionKey, table, setSelectIds]);

    return (
        <div className="flex flex-col gap-2">
            {searchNode && <div className="table-header p-2">{searchNode}</div>}
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                <table className="table w-full">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 tracking-wider"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    {table.getRowModel().rows.length > 0 && (
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className={`px-4 py-2 whitespace-nowrap text-sm text-gray-500 ${
                                                (cell.column.columnDef.meta as any)?.className ?? ''
                                            }`}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
                {table.getRowModel().rows.length === 0 && (
                    <div className="w-full flex justify-center items-center h-[300px]">
                        <div className="text-base-content/50">暂无数据</div>
                    </div>
                )}
            </div>
            {table.getRowModel().rows.length > 0 && pagination && (
                <div className="px-4 py-2 flex justify-end">{pagination}</div>
            )}
        </div>
    );
}
