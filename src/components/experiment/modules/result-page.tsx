import { db } from '@/lib/db';
import { RedirectToQualtrics } from './redirect-to-qualtrics';
import StringHTML from './string-to-html';
import { logger } from '@/lib/logger';
import { ImageHistory } from './image-history';

interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    content: any;
    buttonNum?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    userNanoId: string;
}

export function ResultPage({
    title,
    content,
    userNanoId,
    buttonNum = 0,
    size = 'md',
    children,
}: ComponentProps) {
    const qualtricsUrl = content?.redirect_url;

    // TODO 显示用户所有的出图结果

    return (
        <div className="hero">
            <div className="hero-content text-center">
                <div className={`max-w-${size}`}>
                    <h1 className="text-5xl font-bold mb-8">{title}</h1>
                    <StringHTML htmlString={content?.content as string} />
                    <div className={`flex ${buttonNum > 1 ? 'justify-between' : 'justify-center'}`}>
                        {children}
                    </div>
                    {/* <ImageHistory /> */}
                    <RedirectToQualtrics qualtricsUrl={qualtricsUrl} userUnqiueId={userNanoId} />
                </div>
            </div>
        </div>
    );
}
