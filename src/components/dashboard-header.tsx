import { cn } from "@/lib/utils"

interface DashboardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    heading: string
    text?: string
    children?: React.ReactNode
}

export function DashboardHeader({
    heading,
    text,
    children,
    className,
    ...props
}: DashboardHeaderProps) {
    return (
        <div className={cn("flex justify-between px-2 items-center", className)}>
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
