'use client';

import { getUrl } from '@/lib/url';
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

    async function startExperiment() {
        // 创建实验，然后跳转到对应的路径
        const result = await fetch(getUrl('/api/user/experiment'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                experimentId: experimentId,
            }),
        });
        if (result.ok) {
            const responseBody = await result.json();
            console.log(responseBody, responseBody.data.experimentNanoId);
            const newExperimentId = responseBody.data.experimentNanoId;
            router.push(`/experiments/input/${newExperimentId}`);
            // 保存实验id
            newExperimentId && store('experimentId', newExperimentId);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <button className="btn btn-primary" onClick={startExperiment}>
                开始测验
            </button>
        </div>
    );
}
