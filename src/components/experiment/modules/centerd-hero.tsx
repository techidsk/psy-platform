import { convertToParagraphs } from '@/lib/longtext'

interface CenteredHeroProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    content: string
    buttonNum?: number
}

export function CenteredHero({
    title,
    content,
    buttonNum = 0,
    children
}: CenteredHeroProps) {

    const paragraphs = convertToParagraphs(content)

    return <div className="hero">
        <div className="hero-content text-center">
            <div className="max-w-md">
                <h1 className="text-5xl font-bold mb-12">{title}</h1>
                <div className='flex flex-col gap-4'>
                    {paragraphs.map((p, index) => (
                        <p key={index} className='text-justify'>{p}</p>
                    ))}
                </div>
                <div className={`flex ${buttonNum > 1 ? 'justify-between' : 'justify-center'}`}>
                    {children}
                </div>
            </div>
        </div>
    </div>
}