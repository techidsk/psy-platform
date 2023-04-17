import { cn } from "@/lib/utils"

interface StateProp extends React.HTMLAttributes<HTMLDivElement> {
    type?: string
    children?: React.ReactNode
}

export function State({
    type,
    children,
    className
}: StateProp) {
    const defaultClassName = "px-2 inline-flex text-xs leading-5 font-semibold rounded text-white"
    let colorClassName = ''
    if (type) {
        colorClassName = colorMap.get(type) || ''
    }

    return <span className={cn(defaultClassName, colorClassName, className)} >
        {children}
    </span>
}

const colorMap = new Map([
    ["pending", "bg-yellow-500"],
    ["success", "bg-green-500"],
    ["warn", "bg-orange-500"],
    ["error", "bg-red-500"],
]);
