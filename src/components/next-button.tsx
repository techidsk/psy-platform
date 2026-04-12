'use client';
import { useRouter } from 'next/navigation';

interface NextButtonProp {
    goto: string;
    text: string;
}

export function NextButton({ goto, text }: NextButtonProp) {
    const router = useRouter();

    function onClick() {
        router.push(goto);
    }

    return (
        <button className="btn btn-primary btn-sm" onClick={onClick}>
            {text}
        </button>
    );
}
