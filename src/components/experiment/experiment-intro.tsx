interface IntroProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string

}

export function ExperimentIntro({
    title,
    children
}: IntroProps) {
    return <div className="hero">
        <div className="hero-content text-center">
            <div className="max-w-md">
                <div className='flex flex-col gap-6'>
                    <h1 className="text-5xl font-bold mb-4">{title}</h1>
                    <div className='flex flex-col'>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    </div>
}