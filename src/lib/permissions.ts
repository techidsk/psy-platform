import type { UserRole } from '@/types/user.d';

const EDIT_ROLES: UserRole[] = ['ADMIN', 'SUPERADMIN'];

export function canEdit(role: string | undefined): boolean {
    return !!role && EDIT_ROLES.includes(role as UserRole);
}
