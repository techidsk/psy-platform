'use client';
import { useRouter } from 'next/navigation';

interface ButtonProps {
    data: any;
}

export default function CheckExperimentHistoryButton({ data }: ButtonProps) {
    const router = useRouter();
    function openExperimentPage(id: string) {
        router.push(`/history/${id}`);
    }
    return (
        <div className="flex gap-2">
            <button
                className="btn btn-ghost btn-sm"
                onClick={() => openExperimentPage(data?.nano_id)}
            >
                查看详情
            </button>
        </div>
    );
}
