import { TableConfig } from '@/types/table';

interface TableHeaderProp {
    configs: TableConfig[];
    children?: React.ReactNode;
}

export function TableHeader({ configs, children }: TableHeaderProp) {
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
                        return (
                            <th
                                key={config.label}
                                scope="col"
                                className="px-4 py-2 text-left text-xs font-medium text-gray-500 tracking-wider"
                            >
                                {config.label}
                            </th>
                        );
                    })}
                </tr>
            </thead>
            {children}
        </>
    );
}
