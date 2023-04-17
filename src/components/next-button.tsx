'use client'
import { useRouter } from "next/navigation"

interface NextButtonProp {
    goto: string
}

export function NextButton({
    goto,
}: NextButtonProp) {
    const router = useRouter()

    function onClick() {
        router.push(goto)
    }

    return <button
        className="btn btn-primary w-[96px]"
        onClick={onClick}
    >
        继续
    </button>
}