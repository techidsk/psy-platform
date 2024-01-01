"use client"

import * as React from "react"
import { useState, } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Modal } from "../ui/modal"
import { UserPatchForm } from "./user-patch-form"
import { UserDeleteModal } from "./user-delete-modal"


interface UserTableEditButtonsProps extends React.HTMLAttributes<HTMLButtonElement> {
    userId: number
}

/**
 * 编辑用户，管理员有权限创建学生管理
 * 
 * @param param0 
 * @returns 
 */
export function UserTableEditButtons({
    className,
    userId,
    ...props
}: UserTableEditButtonsProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    function handleToggle() {
        setOpen(!open)
        setIsLoading(!isLoading)
    }

    function close() {
        setOpen(false)
        setIsLoading(false)
        router.refresh()
    }

    async function editUser() {
        console.log("edit user")
        setOpen(true)
    }

    function deleteUser() {
        console.log("delete user")
        setOpenDelete(true)
    }

    function handleDeleteToggle() {
        setOpenDelete(!openDelete)
        setIsLoading(!isLoading)
    }

    function closeDeleteModal() {
        setOpenDelete(false)
        setIsLoading(false)
        router.refresh()
    }

    return (
        <>
            <button
                className={cn(
                    {
                        "cursor-not-allowed opacity-60": isLoading,
                    },
                    'btn btn-ghost btn-sm',
                    className
                )}
                onClick={editUser}
            >
                <Icons.edit className="h-4 w-4" />编辑
            </button>
            <button
                className={cn(
                    {
                        "cursor-not-allowed opacity-60": isLoading,
                    },
                    'btn btn-ghost btn-sm',
                    className
                )}
                onClick={deleteUser}
            >
                <Icons.delete className="h-4 w-4" />删除
            </button>
            {
                open &&
                <Modal className="flex flex-col gap-4" open={open} onClose={handleToggle} disableClickOutside={!open}>
                    <h1 className="text-xl">编辑用户</h1>
                    <UserPatchForm closeModal={close} edit={true} userId={userId} />
                </Modal>
            }
            {
                openDelete &&
                <Modal className="flex flex-col gap-4" open={openDelete} onClose={handleDeleteToggle} disableClickOutside={!openDelete}>
                    <h1 className="text-xl">删除用户</h1>
                    <UserDeleteModal closeModal={closeDeleteModal} userId={userId} />
                </Modal>
            }
        </>
    )
}
