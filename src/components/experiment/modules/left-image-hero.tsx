import { convertToParagraphs } from '@/lib/longtext';

interface LeftImageHeroProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    content: string;
    buttonNum?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function LeftImageHero({
    title,
    content,
    buttonNum = 0,
    children,
    size = 'lg',
}: LeftImageHeroProps) {
    const paragraphs = convertToParagraphs(content);

    return (
        <div className="hero">
            <div className="hero-content flex-col lg:flex-row">
                <img
                    src="https://daisyui.com/images/stock/photo-1635805737707-575885ab0820.jpg"
                    className="max-w-sm rounded-lg shadow-2xl"
                />
                <div className={`max-w-${size}`}>
                    <h1 className="text-5xl font-bold mb-8">{title}</h1>
                    <div className="flex flex-col gap-4 mb-6">
                        {paragraphs.map((p, index) => (
                            <p key={index} className="text-justify">
                                {p}
                            </p>
                        ))}
                    </div>
                    <div className={`flex ${buttonNum > 1 ? 'justify-between' : 'justify-center'}`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
