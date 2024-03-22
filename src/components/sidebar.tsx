'use client';

import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';

import { SidebarNavItem } from '@/types';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

interface DashboardNavProps {
    items: SidebarNavItem[];
}

export function DashboardNav({ items }: DashboardNavProps) {
    const path = usePathname();

    if (!items?.length) {
        return null;
    }

    return (
        <nav className="grid items-start gap-1">
            {items.map((item, index) => {
                const Icon = Icons[item.icon || 'arrowRight'];
                return (
                    item.href && (
                        <>
                            {item.category && (
                                <div className="text-lg px-3 mt-2 select-none">{item.category}</div>
                            )}
                            <Link key={index} href={item.disabled ? '/' : item.href}>
                                <div
                                    className={cn(
                                        'group flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100',
                                        path === item.href ? 'bg-slate-200' : 'transparent',
                                        item.disabled && 'cursor-not-allowed opacity-80'
                                    )}
                                >
                                    <Icon className="mr-2 h-4 w-4" />
                                    <span>{item.title}</span>
                                </div>
                            </Link>
                        </>
                    )
                );
            })}
        </nav>
    );
}
