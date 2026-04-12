import { ColumnDef } from '@tanstack/react-table';
import { UserRole } from '@/types/user';

/**
 * 根据用户角色过滤列定义。
 * SUPERADMIN 看到所有列，其他角色只看到 meta.auth 包含其角色或未设置 auth 的列。
 */
export function filterColumnsByRole<TData>(
    columns: ColumnDef<TData, any>[],
    role: UserRole
): ColumnDef<TData, any>[] {
    if (role === 'SUPERADMIN') return columns;
    return columns.filter((col) => {
        const auth = (col.meta as any)?.auth as UserRole[] | undefined;
        return auth ? auth.includes(role) : true;
    });
}
