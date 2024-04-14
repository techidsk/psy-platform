import { UserRole } from './user';

export type TableConfig = {
    key: string;
    label: string;
    className?: string;
    children: (data: any) => JSX.Element;
    hidden?: boolean;
    auth?: UserRole[];
    checkbox_key?: string;
};
