'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { toast } from '@/hooks/use-toast';
import { getUrl } from '@/lib/url';

interface RegenerateIntentButtonProps {
    nanoId: string;
}

export function RegenerateIntentButton({ nanoId }: RegenerateIntentButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleRegenerate() {
        setIsLoading(true);
        try {
            const res = await fetch(getUrl(`/api/experiment/${nanoId}/analyze`), {
                method: 'POST',
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.msg || '生成失败');
            }
            toast({
                title: '意图画像已更新',
                description: '实验意图已重新生成',
                duration: 3000,
            });
        } catch (err) {
            toast({
                title: '生成失败',
                description: String(err),
                variant: 'destructive',
                duration: 4000,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <button onClick={handleRegenerate} disabled={isLoading} className="btn btn-outline btn-sm">
            {isLoading ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
            ) : (
                <Icons.refresh className="h-4 w-4" />
            )}
            重新生成意图
        </button>
    );
}
