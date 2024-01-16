'use client';

import { useRouter } from 'next/navigation';
export function DashboardReturnButtons() {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-4">
            <button className="btn btn-primary" onClick={() => router.push('/history')}>
                查看实验记录
            </button>
        </div>
    );
}
