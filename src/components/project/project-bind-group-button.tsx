'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useProjectState } from '@/state/_project_atoms';
import { getUrl } from '@/lib/url';
import { useTableState } from '@/state/_table_atom';
import { toast } from '@/hooks/use-toast';

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {}

/**
 * 绑定对应项目分组
 *
 * @param param0
 * @returns
 */
export function ProjectBindGroupButton({ className, ...props }: ButtonProps) {
    const router = useRouter();
    const itemName = 'project-group-ids';

    const selectedIds = useTableState((state) => state.selectedIds);
    const selectedProjectId = useProjectState((state) => state.projectId);
    // const selectedProjectId = useProjectState((state) => state.projectId);

    async function onClick() {
        console.log({
            project_id: selectedProjectId,
            group_ids: selectedIds[itemName],
        });
        const result = await fetch(getUrl('/api/project/group/bind'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project_id: selectedProjectId,
                group_ids: selectedIds[itemName],
            }),
        });
        if (result.ok) {
            const responseBody = await result.json();
            toast({
                title: '关联成功',
                description: responseBody.msg || '已成功关联成功',
                duration: 3000,
            });
            router.push('/projects');
        } else {
            const responseBody = await result.json();
            toast({
                title: '关联失败',
                description: responseBody.msg || '请查看系统消息',
                variant: 'destructive',
                duration: 5000,
            });
        }
    }

    return (
        <>
            <button onClick={onClick} className={cn(className)} {...props}>
                确认
            </button>
        </>
    );
}
