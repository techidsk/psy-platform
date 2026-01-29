import React from 'react';
import { TableHeader } from './table-header';
import { TableRow } from './table-row';
import { TableConfig } from '@/types/table';
import { getCurrentUser } from '@/lib/session';
import { UserRole } from '@/types/user';

interface TableProp {
    datas: any[];
    configs: TableConfig[];
    children?: React.ReactNode;
    searchNode?: React.ReactNode;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export async function Table({
    datas,
    configs,
    children,
    searchNode,
    sortBy,
    sortOrder,
}: TableProp) {
    const currentUser = await getCurrentUser();
    const role = currentUser?.role as UserRole;

    let filterConfigs = configs;
    if (role !== 'SUPERADMIN') {
        filterConfigs = configs.filter((config) => {
            return config.auth ? config.auth.includes(role) : true;
        });
    }

    return (
        <div className="flex flex-col gap-2">
            {searchNode && <div className="table-header p-2">{searchNode}</div>}
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                <table className="table w-full">
                    <TableHeader
                        configs={filterConfigs}
                        datas={datas}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                    />
                    {datas.length > 0 && (
                        <tbody>
                            {datas.map((data) => {
                                return (
                                    <TableRow key={data.id} data={data} configs={filterConfigs} />
                                );
                            })}
                        </tbody>
                    )}
                </table>
                {datas.length === 0 && (
                    <div className="w-full flex justify-center items-center h-[300px]">
                        <div className="text-base-content/50">暂无数据</div>
                    </div>
                )}
            </div>
            {datas.length > 0 && children && (
                <div className="px-4 py-2 flex justify-end">{children}</div>
            )}
        </div>
    );
}

export function NoAuthTable({ datas, configs, children, searchNode }: TableProp) {
    return (
        <div className="flex flex-col gap-2">
            {searchNode && <div className="table-header p-2">{searchNode}</div>}
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                <table className="table w-full">
                    <TableHeader configs={configs} />
                    {datas.length > 0 && (
                        <tbody>
                            {datas.map((data) => {
                                return <TableRow key={data.id} data={data} configs={configs} />;
                            })}
                        </tbody>
                    )}
                </table>
                {datas.length === 0 && (
                    <div className="w-full flex justify-center items-center h-[300px]">
                        <div className="text-base-content/50">暂无数据</div>
                    </div>
                )}
            </div>
            {datas.length > 0 && children && (
                <div className="px-4 py-2 flex justify-end">{children}</div>
            )}
        </div>
    );
}
