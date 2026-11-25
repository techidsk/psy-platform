import { logger } from '@/lib/logger';
import Link from 'next/link';

interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
    qualtricsUrl: string;
    userUnqiueId: string;
    userQualtrics: string;
}

// 跳转到 Qualtrics 页面
export function RedirectToQualtrics({ qualtricsUrl, userUnqiueId, userQualtrics }: ComponentProps) {
    // logger.info(`qualtricsUrl: ${qualtricsUrl} userUnqiueId: ${userUnqiueId}`);
    // 验证 url 以及 unqiueId 是否合法
    if (!qualtricsUrl || !userUnqiueId) {
        logger.error('qualtricsUrl 或 userUnqiueId 为空');
        return null;
    }

    const fragmentStart = qualtricsUrl.indexOf('#');
    const address = fragmentStart < 0 ? qualtricsUrl : qualtricsUrl.slice(0, fragmentStart);
    const fragment = fragmentStart < 0 ? '' : qualtricsUrl.slice(fragmentStart);
    const queryStart = address.indexOf('?');
    const path = queryStart < 0 ? address : address.slice(0, queryStart);
    const params = new URLSearchParams(queryStart < 0 ? '' : address.slice(queryStart));
    params.set('id', userUnqiueId);
    params.set('qualtricsId', userQualtrics);
    const targetUrl = `${path}?${params}${fragment}`;

    return (
        <div className="flex gap-4 justify-center">
            <Link href={targetUrl} target="_blank">
                <button className="btn  btn-primary">继续实验</button>
            </Link>
        </div>
    );
}
