import { cn } from '@/lib/utils';
import { TableConfig } from '@/types/table';
interface TableRowProp {
    data: object;
    configs: TableConfig[];
    children?: React.ReactNode;
}

export function TableRow({ data, configs, children }: TableRowProp) {
    const defaultClassName = 'px-4 py-2 whitespace-nowrap text-sm text-gray-500';

    return (
        <tr>
            {configs.map((config) => (
                <td className={cn(defaultClassName, config.className)} key={config.label}>
                    {config.children(data)}
                </td>
            ))}
        </tr>
    );
}
