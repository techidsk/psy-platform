'use client';

import { getUrl } from '@/lib/url';
import { useRouter } from 'next/navigation';
import store from 'store2';
import { getId } from '@/lib/nano-id';

interface Buttons extends React.HTMLAttributes<HTMLDivElement> {
    experimentId: number;
    userUniqueKey?: string;
    engineId?: number;
}

export function GuestExperimentStarterButtons({
    experimentId, // 实验 nano_id
    userUniqueKey,
    engineId,
}: Buttons) {
    const router = useRouter();

    async function insertGuestUser() {
        const guestUser = await fetch(getUrl('/api/guest/add'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nano_id: userUniqueKey,
            }),
        });
        return guestUser;
    }

    async function startExperiment() {
        await insertGuestUser();

        // 创建实验，然后跳转到对应的路径
        const experimentNanoId = getId();

        const result = await fetch(getUrl('/api/guest/experiment'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                experiment_id: experimentId.toString(),
                nano_id: experimentNanoId,
                engine_id: engineId,
                type: 'GUEST_EXPERIMENT',
                user_id: userUniqueKey,
            }),
        });
        if (result.ok) {
            const responseBody = await result.json();
            const userExperimentNanoId = responseBody.data.userExperimentNanoId;
            router.push(`/guest/input/${userUniqueKey}?e=${userExperimentNanoId}`);
            userExperimentNanoId && store('experimentId', userExperimentNanoId);
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
