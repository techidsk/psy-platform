"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { getId } from '@/lib/nano-id'


interface ExperimentCreateButtonProps
    extends React.HTMLAttributes<HTMLButtonElement> { }

export function ExperimentCreateButton({
    className,
    ...props
}: ExperimentCreateButtonProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    async function onClick() {
        const id = getId()
        router.push(`/experiment/${id}`)
    }

    return (
        <button
            onClick={onClick}
            className={cn(
                {
                    "cursor-not-allowed opacity-60": isLoading,
                },
                className
            )}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Icons.add className="mr-2 h-4 w-4" />
            )}
            添加
        </button>
    )
}
