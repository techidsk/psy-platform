'use client';

import { useRouter } from 'next/navigation';
import store from 'store2';

interface Buttons extends React.HTMLAttributes<HTMLDivElement> {
    experimentId?: string;
}

export function ExperimentStarterButtons({
    experimentId, // 实验 nano_id
    children,
}: Buttons) {
    const router = useRouter();

    function startExperiment() {
        router.push(`/test/${experimentId}`);
        // 保存实验id
        experimentId && store('experimentId', experimentId);
    }

    return (
        <div className="flex flex-col gap-4">
            <button className="btn btn-primary" onClick={startExperiment}>
                开始测验
            </button>
        </div>
    );
}
