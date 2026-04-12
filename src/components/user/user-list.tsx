'use client';

import { useEffect, useState, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { State } from '@/components/state';
import { UserTableEditButtons } from '@/components/user/user-table-edit-buttons';
import Pagination from '@/components/pagination';
import { createPaginationStore } from '@/state/_pagination_atom';
import { UserRole } from '@/types/user';
import { filterColumnsByRole } from '@/lib/table-utils';

const useUserPagination = createPaginationStore(10);

interface SearchField {
    name: string;
    type: string;
    placeholder?: string;
    values?: { value: string; label: string }[];
}

const searchFields: SearchField[] = [
    { name: 'username', type: 'input', placeholder: '请输入用户名' },
    { name: 'email', type: 'input', placeholder: '请输入电子邮件' },
    { name: 'tel', type: 'input', placeholder: '请输入联系电话' },
    { name: 'qualtrics', type: 'input', placeholder: '请输入Qualtrics账号' },
    { name: 'wechat_id', type: 'input', placeholder: '请输入微信账号' },
    { name: 'group_name', type: 'input', placeholder: '请输入用户组' },
    {
        name: 'role',
        type: 'select',
        placeholder: '请选择用户角色',
        values: [
            { value: '', label: '' },
            { value: 'ADMIN', label: '管理员' },
            { value: 'ASSISTANT', label: '助教' },
            { value: 'USER', label: '测试者' },
            { value: 'GUEST', label: '访客' },
        ],
    },
];

const userColumns: ColumnDef<any, any>[] = [
    {
        accessorKey: 'username',
        header: () => '用户名',
        cell: ({ row }) => (
            <div className="flex flex-col gap-2 items-center">
                <div className="avatar">
                    <div className="rounded-full">
                        <img
                            src="https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar.avif"
                            alt={row.original.username}
                            width={48}
                            height={48}
                        />
                    </div>
                </div>
                <span>{row.original.username}</span>
            </div>
        ),
    },
    {
        accessorKey: 'email',
        header: () => '联系方式',
        cell: ({ row }) => (
            <div className="flex flex-col gap-2">
                <span>{row.original.email}</span>
                <span>{row.original.tel}</span>
            </div>
        ),
    },
    {
        accessorKey: 'qualtrics',
        header: () => 'Qualtrics',
        cell: ({ row }) => (
            <div className="flex flex-col gap-2">
                <a className="dooom-link" href={row.original.qualtrics}>
                    {row.original.qualtrics}
                </a>
            </div>
        ),
    },
    {
        accessorKey: 'wechat_id',
        header: () => '微信',
        cell: ({ row }) => <div className="flex flex-col gap-2">{row.original.wechat_id}</div>,
    },
    {
        accessorKey: 'user_role',
        header: () => '角色',
        cell: ({ row }) => {
            const userGroups: Record<UserRole, { text: string; state: string }> = {
                USER: { text: '测试者', state: 'success' },
                ADMIN: { text: '管理员', state: 'error' },
                ASSISTANT: { text: '助教', state: 'pending' },
                GUEST: { text: '访客', state: 'warn' },
                SUPERADMIN: { text: '算法专家', state: 'warn' },
            };
            const obj = userGroups[row.original.user_role as UserRole];
            return (
                <div className="flex flex-col gap-2 items-start">
                    <State type={obj.state}>{obj.text}</State>
                </div>
            );
        },
    },
    {
        accessorKey: 'user_group',
        header: () => '分组',
        meta: { auth: ['ADMIN'] as UserRole[] },
        cell: ({ row }) => {
            const group = row.original.user_group_name
                ? { text: row.original.user_group_name, state: 'pending' }
                : { text: '暂无分组', state: 'warn' };
            return (
                <div className="flex flex-col gap-2 items-start">
                    <State type={group.state}>{group.text}</State>
                </div>
            );
        },
    },
    {
        accessorKey: 'create_time',
        header: () => <span className="sr-only">登录时间</span>,
        cell: ({ row }) => (
            <div className="flex flex-col gap-2 items-start">
                <span className="text-xs">创建时间: {row.original.create_time}</span>
                <span className="text-xs">最近登录: {row.original.last_login_time}</span>
            </div>
        ),
    },
    // actions 列由 getColumns(role) 动态插入
];

function getColumns(role: UserRole): ColumnDef<any, any>[] {
    const allColumns: ColumnDef<any, any>[] = [
        ...userColumns,
        {
            id: 'actions',
            header: () => <span className="sr-only">操作</span>,
            cell: ({ row }) => (
                <div className="flex gap-4 items-center">
                    <UserTableEditButtons userId={row.original.id} currentUserRole={role} />
                </div>
            ),
        },
    ];
    return filterColumnsByRole(allColumns, role);
}

export function UserList({ role }: { role: UserRole }) {
    const { page, pageSize, total, loading, setPage, setPageSize, setTotal, setLoading } =
        useUserPagination();
    const [data, setData] = useState<any[]>([]);
    const [searchValues, setSearchValues] = useState<Record<string, string>>({});

    const columns = getColumns(role);

    const fetchUsers = useCallback(
        async (p: number, ps: number, search: Record<string, string>) => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.set('page', String(p));
                params.set('pagesize', String(ps));
                Object.entries(search).forEach(([k, v]) => {
                    if (v) params.set(k, v);
                });

                const res = await fetch(`/api/users?${params.toString()}`);
                if (!res.ok) return;
                const json = await res.json();
                setData(json.data);
                setTotal(json.total);
            } finally {
                setLoading(false);
            }
        },
        [setLoading, setTotal]
    );

    useEffect(() => {
        fetchUsers(page, pageSize, searchValues);
    }, [page, pageSize, fetchUsers]);

    const handleSearch = () => {
        setPage(1);
        fetchUsers(1, pageSize, searchValues);
    };

    const handleReset = () => {
        setSearchValues({});
        setPage(1);
        fetchUsers(1, pageSize, {});
    };

    const handleFieldChange = (name: string, value: string) => {
        setSearchValues((prev) => ({ ...prev, [name]: value }));
    };

    const searchNode = (
        <div className="grid gap-2">
            <div className="grid gap-4 grid-cols-4">
                {searchFields.map((field) => (
                    <div key={field.name}>
                        {field.type === 'input' ? (
                            <input
                                type="text"
                                placeholder={field.placeholder}
                                value={searchValues[field.name] || ''}
                                className="input w-full max-w-xs"
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            />
                        ) : field.type === 'select' && field.values ? (
                            <select
                                className="select w-full max-w-xs"
                                value={searchValues[field.name] || ''}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            >
                                {field.values.map(({ value, label }) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        ) : null}
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-4">
                <button className="btn btn-outline btn-sm" onClick={handleReset}>
                    重置搜索
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleSearch}>
                    搜索
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex flex-col gap-2">
                <div className="table-header p-2">{searchNode}</div>
                <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                    <div className="w-full flex justify-center items-center h-[300px]">
                        <span className="loading loading-spinner loading-md"></span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <DataTable
            columns={columns}
            data={data}
            searchNode={searchNode}
            pagination={
                <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                />
            }
        />
    );
}
