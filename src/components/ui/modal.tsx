import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import { useOnClickOutside } from "usehooks-ts";

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
    open: boolean
    onClose(): void
    disableClickOutside?: boolean
}

export function Modal({
    open,
    disableClickOutside,
    onClose,
    className,
    children
}: ModalProps) {

    const ref = useRef(null);
    useOnClickOutside(ref, () => {
        if (!disableClickOutside) {
            onClose();
        }
    });

    const modalClass = cn({
        "modal modal-bottom sm:modal-middle": true,
        "modal-open": open,
    });

    return (
        <div className={modalClass}>
            <div className={cn("modal-box", className)} ref={ref}>
                {children}
            </div>
        </div>
    )

}