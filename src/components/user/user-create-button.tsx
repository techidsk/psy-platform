"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { getId } from '@/lib/nano-id'
import { Modal } from "../ui/modal"
import { UserCreateForm } from "./user-create-form"


interface CreateUserButtonProps extends React.HTMLAttributes<HTMLButtonElement> { }

/**
 * 创建用户，管理员有权限创建学生管理
 * 
 * @param param0 
 * @returns 
 */
export function CreateUserButton({
    className,
    ...props
}: CreateUserButtonProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [open, setOpen] = useState(false);
    const [nanoId, setNanoId] = useState("")
    const [user, setUser] = useState(null)

    function handleToggle() {
        setOpen(!open)
        setIsLoading(!isLoading)
    }

    async function onClick() {
        setIsLoading(true)
        const id = getId()
        setNanoId(id)
        setOpen(true)
    }

    return (
        <>
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
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                ) : (
                    <Icons.add className="h-4 w-4" />
                )}
                创建
            </button>
            <Modal className="flex flex-col gap-4" open={open} onClose={handleToggle} disableClickOutside={!open}>
                <h1 className="text-2xl">创建用户</h1>
                <UserCreateForm nano_id={nanoId} user={user} />
            </Modal>
        </>
    )
}
