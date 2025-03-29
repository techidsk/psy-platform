'use client';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { getUrl } from '@/lib/url';
import { useRouter } from 'next/navigation';

interface CheckProps {
    data: any;
}

export default function GuestModeChecker({ data }: CheckProps) {
    const router = useRouter();
    async function patchProject() {
        if (!data || !data.id) {
            toast({
                title: '更新失败',
                description: '项目ID不存在',
                variant: 'destructive',
                duration: 5000,
            });
            return;
        }

        try {
            const result = await fetch(getUrl(`/api/project/patch`), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: data.id,
                    private: Number(!data.private),
                }),
            });
            const responseBody = await result.json();
            if (result.ok) {
                toast({
                    title: '更新成功',
                    description: responseBody.msg || '已成功更新项目',
                    duration: 3000,
                });
            } else {
                toast({
                    title: '更新失败',
                    description: responseBody.msg || '请查看系统消息',
                    variant: 'destructive',
                    duration: 5000,
                });
            }
        } catch (error) {
            logger.error('请求失败:', error);
            toast({
                title: '请求错误',
                description: '无法连接到服务器，请稍后再试。',
                variant: 'destructive',
                duration: 5000,
            });
        }
        router.refresh();
    }

    return (
        <>
            <div className="form-control">
                <label className="label cursor-pointer">
                    <input
                        type="checkbox"
                        className="toggle toggle-primary toggle-sm"
                        checked={data.private}
                        onChange={patchProject}
                    />
                </label>
            </div>
        </>
    );
}
