import { logger } from '@/lib/logger';
import Link from 'next/link';

interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
    qualtricsUrl: string;
    userUnqiueId: string;
}

// 跳转到 Qualtrics 页面
export function RedirectToQualtrics({ qualtricsUrl, userUnqiueId }: ComponentProps) {
    // logger.info(`qualtricsUrl: ${qualtricsUrl} userUnqiueId: ${userUnqiueId}`);
    // 验证 url 以及 unqiueId 是否合法
    if (!qualtricsUrl || !userUnqiueId) {
        logger.error('qualtricsUrl 或 userUnqiueId 为空');
        return null;
    }

    // qualtricsUrl https://survey.smith.queensu.ca/jfe/form/SV_bOycfWfCnnd3fz8?id=xxxx
    const targetUrl = `${qualtricsUrl}?id=${userUnqiueId}`;

    return (
        <div className="flex gap-4 justify-center">
            <Link href={targetUrl} target="_blank">
                <button className="btn  btn-primary">继续实验</button>
            </Link>
        </div>
    );
}
