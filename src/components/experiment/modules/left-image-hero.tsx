import StringHTML from './string-to-html';

interface LeftImageHeroProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    content?: string;
    buttonNum?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function LeftImageHero({
    title,
    content = '',
    buttonNum = 0,
    children,
    size = 'md',
}: LeftImageHeroProps) {
    return (
        <div className="hero flex flex-col gap-4">
            <div className="hero-content flex-col lg:flex-row">
                <img
                    src="https://daisyui.com/images/stock/photo-1635805737707-575885ab0820.jpg"
                    className="max-w-sm rounded-lg shadow-2xl"
                    alt=""
                />
                <div className={`max-w-${size}`}>
                    {title && <h1 className="text-5xl font-bold mb-8">{title}</h1>}
                    <StringHTML htmlString={content} />
                </div>
            </div>

            <div className={`flex w-full ${buttonNum > 1 ? 'justify-between' : 'justify-center'}`}>
                {children}
            </div>
        </div>
    );
}
