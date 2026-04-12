import { cn } from '@/lib/utils';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    heading: string;
    text?: string;
    children?: React.ReactNode;
}

export function PageHeader({ heading, text, children, className, ...props }: PageHeaderProps) {
    return (
        <div className={cn('flex justify-between px-2 items-center', className)} {...props}>
            <div className="grid gap-1">
                <h1 className="text-base md:text-lg lg:text-xl font-bold tracking-wide text-slate-900">
                    {heading}
                </h1>
                {text && <p className="text-xs md:text-sm text-neutral-500">{text}</p>}
            </div>
            {children}
        </div>
    );
}
