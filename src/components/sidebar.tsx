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

function NavItem({ item, path }: { item: SidebarNavItem; path: string }) {
    const Icon = Icons[item.icon || 'arrowRight'];
    const isActive = item.href && path === item.href;
    const hasSubItems = item.items && item.items.length > 0;

    if (hasSubItems) {
        return (
            <li>
                {item.href ? (
                    <Link
                        href={item.disabled ? '/' : item.href}
                        className={cn(
                            isActive && 'active',
                            item.disabled && 'pointer-events-none opacity-50'
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {item.title}
                    </Link>
                ) : (
                    <span className="menu-dropdown-toggle">
                        <Icon className="h-4 w-4" />
                        {item.title}
                    </span>
                )}
                <ul>
                    {item.items?.map((subItem, subIndex) => (
                        <li key={subIndex}>
                            <Link
                                href={subItem.disabled ? '/' : subItem.href}
                                className={cn(
                                    path === subItem.href && 'active',
                                    subItem.disabled && 'pointer-events-none opacity-50'
                                )}
                            >
                                {subItem.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </li>
        );
    }

    return (
        <li>
            {item.href && (
                <Link
                    href={item.disabled ? '/' : item.href}
                    className={cn(
                        isActive && 'active',
                        item.disabled && 'pointer-events-none opacity-50'
                    )}
                >
                    <Icon className="h-4 w-4" />
                    {item.title}
                </Link>
            )}
        </li>
    );
}

export function DashboardNav({ items }: DashboardNavProps) {
    const path = usePathname();

    if (!items?.length) {
        return null;
    }

    // 按 category 分组
    const groupedItems: { category?: string; items: SidebarNavItem[] }[] = [];
    let currentGroup: { category?: string; items: SidebarNavItem[] } | null = null;

    items.forEach((item) => {
        if (item.category) {
            if (currentGroup) {
                groupedItems.push(currentGroup);
            }
            currentGroup = { category: item.category, items: [item] };
        } else if (currentGroup) {
            currentGroup.items.push(item);
        } else {
            currentGroup = { items: [item] };
        }
    });

    if (currentGroup) {
        groupedItems.push(currentGroup);
    }

    return (
        <ul className="menu bg-base-200 rounded-box w-full">
            {groupedItems.map((group, groupIndex) => (
                <React.Fragment key={groupIndex}>
                    {group.category && <li className="menu-title">{group.category}</li>}
                    {group.items.map((item, itemIndex) => (
                        <NavItem key={itemIndex} item={item} path={path || ''} />
                    ))}
                </React.Fragment>
            ))}
        </ul>
    );
}
