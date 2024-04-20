import { db } from '@/lib/db';
import { RedirectToQualtrics } from './redirect-to-qualtrics';
import StringHTML from './string-to-html';
import { logger } from '@/lib/logger';

interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    content: any;
    buttonNum?: number;
    userId: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export async function ResultPage({
    title,
    content,
    userId,
    buttonNum = 0,
    size = 'md',
    children,
}: ComponentProps) {
    const qualtricsUrl = content?.redirect_url;

    const user = await db.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            nano_id: true,
        },
    });

    if (!user?.nano_id) {
        logger.error('User nanoId is not found');
        return null;
    }
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
                    <RedirectToQualtrics qualtricsUrl={qualtricsUrl} userUnqiueId={user?.nano_id} />
                </div>
            </div>
        </div>
    );
}
