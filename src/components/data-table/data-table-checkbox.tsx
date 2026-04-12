'use client';

import { Table, Row } from '@tanstack/react-table';

interface DataTableCheckboxProps<TData> {
    table?: Table<TData>;
    row?: Row<TData>;
}

export function DataTableCheckbox<TData>({ table, row }: DataTableCheckboxProps<TData>) {
    if (table) {
        // Header: select all
        return (
            <div className="flex justify-center items-center">
                <input
                    type="checkbox"
                    className="checkbox"
                    checked={table.getIsAllPageRowsSelected()}
                    onChange={table.getToggleAllPageRowsSelectedHandler()}
                />
            </div>
        );
    }

    if (row) {
        // Row: individual select
        return (
            <div className="flex justify-center items-center">
                <input
                    type="checkbox"
                    className="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                />
            </div>
        );
    }

    return null;
}
