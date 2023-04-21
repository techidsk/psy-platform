'use client'
import { useRouter } from "next/navigation"

interface NextButtonProp {
    goto: string
    text: string
}

export function NextButton({
    goto,
    text
}: NextButtonProp) {
    const router = useRouter()

    function onClick() {
        router.push(goto)
    }

    return <button
        className="btn btn-primary w-[96px]"
        onClick={onClick}
    >
        {text}
    </button>
}