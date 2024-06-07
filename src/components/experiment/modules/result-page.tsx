import { RedirectToQualtrics } from './redirect-to-qualtrics';
import StringHTML from './string-to-html';
import { ImageHistory } from './image-history';

interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    content: any;
    uniqueKey: string;
    buttonNum?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    userNanoId: string;
    userExperimentNanoId: string;
}

export function ResultPage({
    title,
    content,
    userNanoId,
    uniqueKey,
    buttonNum = 0,
    size = 'md',
    userExperimentNanoId,
    children,
}: ComponentProps) {
    const qualtricsUrl = content?.redirect_url;

    const historyMode = Boolean(content?.history_mode);

    return (
        <div className="hero">
            <div className="hero-content text-center">
                <div className={`max-w-${size} flex flex-col gap-2`}>
                    {title && <h1 className="text-5xl font-bold mb-8">{title}</h1>}
                    {/* 指导语 */}
                    <StringHTML htmlString={content?.content as string} />
                    {historyMode && (
                        <>
                            <div className="divider"></div>
                            <ImageHistory
                                userExperimentNanoId={userExperimentNanoId}
                                userId={userNanoId}
                            />
                        </>
                    )}
                    <div className="text text-slate-500 dark:text-slate-400 mb-2">
                        这是您本次实验的写作ID{'  '}
                        <kbd className="kbd kbd-md">{uniqueKey}</kbd>
                    </div>
                    <div className="text text-slate-500 dark:text-slate-400 mb-4">
                        请复制保存ID，我们将在页面跳转后要求你输入ID
                    </div>
                    <RedirectToQualtrics qualtricsUrl={qualtricsUrl} userUnqiueId={userNanoId} />
                    <div className={`flex ${buttonNum > 1 ? 'justify-between' : 'justify-center'}`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
