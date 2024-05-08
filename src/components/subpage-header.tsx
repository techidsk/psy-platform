'use client';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';

interface BackHeaderProp extends React.HTMLAttributes<HTMLDivElement> {
    back?: string;
}

export default function SubpageHeader({ back, children }: BackHeaderProp) {
    const router = useRouter();

    function onClick() {
        if (back) {
            router.push(back);
            setTimeout(() => {
                router.refresh();
            }, 50);
        } else {
            router.back();
            setTimeout(() => {
                router.refresh();
            }, 50);
        }
    }

    return (
        <div className="mb-4">
            <div className="flex justify-between">
                <div data-name="left-part">
                    <button className="btn btn-ghost btn-sm" onClick={onClick}>
                        <Icons.back />
                        返回
                    </button>
                </div>
                <div data-name="right-part">{children}</div>
            </div>
        </div>
    );
}

interface SubpageContentHeaderProps {
    heading: string;
    text?: string;
    children?: React.ReactNode;
}

export function SubpageContentHeader({ heading, text, children }: SubpageContentHeaderProps) {
    return (
        <div className="flex justify-between px-2 items-center">
            <div className="grid gap-1">
                <h1 className="text-xl font-bold tracking-wide text-slate-900">{heading}</h1>
                {text && <p className="text-sm text-neutral-500">{text}</p>}
            </div>
            {children}
        </div>
    );
}
