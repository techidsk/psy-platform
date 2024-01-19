'use client';

import { useRouter } from 'next/navigation';
import { usePreExperimentState } from '@/state/_pre_atoms';

interface Buttons extends React.HTMLAttributes<HTMLDivElement> {
    engineId?: number | null;
    nanoId?: string;
}

// 直接开始实验
export function ExperimentStartButton({ engineId, nanoId, children }: Buttons) {
    const router = useRouter();
    const setEngine = usePreExperimentState((state) => state.setEngine);

    function startExperiment() {
        setEngine({
            id: engineId,
        });
        router.push(`/experiments/input/${nanoId}`);
    }

    function startTest() {
        setEngine({
            id: engineId,
        });
        router.push(`/test/input/${nanoId}`);
    }

    return (
        <div className="flex gap-4">
            <button className="btn btn-ghost btn-outline" onClick={startExperiment}>
                直接开始
            </button>
            <button className="btn btn-primary" onClick={startTest}>
                开始测试
            </button>
        </div>
    );
}
