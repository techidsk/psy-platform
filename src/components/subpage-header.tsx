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
        } else {
            router.back();
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
