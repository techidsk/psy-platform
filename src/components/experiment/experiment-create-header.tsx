interface ExperimentHeaderProps {
    heading: string
    text?: string
    children?: React.ReactNode
}

export function ExperimentCreateHeader({
    heading,
    text,
    children,
}: ExperimentHeaderProps) {
    return (
        <div className="flex justify-between px-2 items-center">
            <div className="grid gap-1">
                <h1 className="text-xl font-bold tracking-wide text-slate-900">
                    {heading}
                </h1>
                {text && <p className="text-sm text-neutral-500">{text}</p>}
            </div>
            {children}
        </div>
    )
}
