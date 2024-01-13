'use client';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';

interface BackButtonProp {
    back: string;
}

export function BackButton({ back }: BackButtonProp) {
    const router = useRouter();

    function onClick() {
        router.push(back);
    }

    return (
        <button className="btn btn-ghost w-[96px]" onClick={onClick}>
            <Icons.chevronLeft className="mr-2 h-4 w-4" />
            返回
        </button>
    );
}
