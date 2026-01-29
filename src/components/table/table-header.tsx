import { TableConfig } from '@/types/table';
import SelectAllCheckbox from './select-all-checkbox';
import { TableSortButton } from './table-sort-button';

interface TableHeaderProp {
    configs: TableConfig[];
    children?: React.ReactNode;
    datas?: any[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export function TableHeader({ configs, children, datas, sortBy, sortOrder }: TableHeaderProp) {
    return (
        <>
            <thead>
                <tr>
                    {configs.map((config) => {
                        if (config?.hidden) {
                            return (
                                <th scope="col" className="relative px-6 py-3" key={config.label}>
                                    <span className="sr-only">{config.label}</span>
                                </th>
                            );
                        }
                        if (config.key === 'checkbox') {
                            return (
                                <th key={config.label} scope="col" className="relative px-6 py-3">
                                    <div className="flex-col-center">
                                        <SelectAllCheckbox
                                            datas={datas}
                                            item_key={config.checkbox_key}
                                        />
                                    </div>
                                </th>
                            );
                        }

                        const sortKey = config.sortKey || config.key;

                        return (
                            <th
                                key={config.label}
                                scope="col"
                                className="px-4 py-2 text-left text-xs font-medium text-gray-500 tracking-wider"
                            >
                                {config.sortable ? (
                                    <TableSortButton
                                        sortKey={sortKey}
                                        currentSortBy={sortBy}
                                        currentSortOrder={sortOrder}
                                    >
                                        {config.label}
                                    </TableSortButton>
                                ) : (
                                    config.label
                                )}
                            </th>
                        );
                    })}
                </tr>
            </thead>
            {children}
        </>
    );
}
