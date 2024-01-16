import { UserRole } from './user';

export type TableConfig = {
    key: string;
    label: string;
    className?: string;
    children: Function;
    hidden?: boolean;
    auth?: UserRole[];
};
