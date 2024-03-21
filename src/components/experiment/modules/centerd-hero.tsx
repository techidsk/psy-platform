import StringHTML from './string-to-html';

interface CenteredHeroProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    content: string;
    buttonNum?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function CenteredHero({
    title,
    content,
    buttonNum = 0,
    size = 'md',
    children,
}: CenteredHeroProps) {
    return (
        <div className="hero">
            <div className="hero-content text-center">
                <div className={`max-w-${size}`}>
                    <h1 className="text-5xl font-bold mb-8">{title}</h1>
                    <StringHTML htmlString={content} />
                    <div className={`flex ${buttonNum > 1 ? 'justify-between' : 'justify-center'}`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
