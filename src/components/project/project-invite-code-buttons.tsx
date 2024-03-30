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
export async function ProjectInviteCodeButton({
    data,
    url,
    className,
    ...props
}: InviteCodeButtonProps) {
    const router = useRouter();

    function copyInviteLink() {
        const navigateToUrl = `${window.location.origin}${url}`;
        navigator.clipboard.writeText(navigateToUrl);
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
                <button className="btn btn-link btn-xs" onClick={() => copyInviteLink()}>
                    <span className="flex gap-1 justify-center items-center">
                        复制链接
                        <Icons.copy size={16} />
                    </span>
                </button>
            </div>
        </div>
    );
}
