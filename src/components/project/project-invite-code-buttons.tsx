'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import { getUrl } from '@/lib/url';
import { toast } from '@/hooks/use-toast';

interface InviteCodeButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    data: any;
    url: string;
}

/**
 * 创建项目
 *
 * @param param0
 * @returns
 */
export function ProjectInviteCodeButton({ data, url, className, ...props }: InviteCodeButtonProps) {
    const router = useRouter();

    async function copyInviteLink() {
        try {
            const result = await fetch(`/api/project/test/${data.id}`);
            const responseBody = await result.json();

            if (!result.ok) {
                return toast({
                    title: '复制失败',
                    description: responseBody.msg,
                    variant: 'destructive',
                    duration: 5000,
                });
            }

            const navigateToUrl = `${window.location.origin}${url}`;
            await navigator.clipboard.writeText(navigateToUrl);
            toast({
                title: '复制成功',
                description: '已复制链接到剪切板',
                duration: 5000,
            });
        } catch (err) {
            console.error('[copyInviteLink] 错误:', err);
            toast({
                title: '复制失败',
                description: err instanceof Error ? err.message : '未知错误',
                variant: 'destructive',
                duration: 5000,
            });
        }
    }

    async function updateInviteCode() {
        const result = await fetch(getUrl(`/api/project/update/code/${data.id}`), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        router.refresh();
        const responseBody = await result.json();

        if (result.ok) {
            return toast({
                title: '更新成功',
                description: '邀请码已经更新',
                duration: 5000,
            });
        } else {
            return toast({
                title: '更新失败',
                description: responseBody.message,
                variant: 'destructive',
                duration: 5000,
            });
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div>邀请码: {data.invite_code}</div>
            <div className="flex gap-2">
                <button className="btn btn-link btn-xs" onClick={() => updateInviteCode()}>
                    <span className="flex gap-1 justify-center items-center">
                        更新邀请码
                        <Icons.refresh size={16} />
                    </span>
                </button>
                {data.invite_code && (
                    <button className="btn btn-link btn-xs" onClick={() => copyInviteLink()}>
                        <span className="flex gap-1 justify-center items-center">
                            复制链接
                            <Icons.copy size={16} />
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
}
