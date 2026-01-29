import { UserRole } from './user';

export type TableConfig = {
    key: string;
    label: string;
    className?: string;
    children: (data: any) => JSX.Element;
    hidden?: boolean;
    auth?: UserRole[];
    checkbox_key?: string;
    /** 排序字段 key，设置后表头可点击排序 */
    sortable?: boolean;
    /** 排序时使用的字段名，默认使用 key */
    sortKey?: string;
};
