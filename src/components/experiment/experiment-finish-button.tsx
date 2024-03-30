'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageResponse } from '@/types/experiment';
import { getUrl } from '@/lib/url';

interface ExperimentFinishProps extends React.HTMLAttributes<HTMLButtonElement> {
    nanoId: string; // user_experiment表中的nano_id
    disable?: boolean;
    guest?: boolean;
    experimentList: ImageResponse[];
}

export function ExperimentFinishButton({
    nanoId: userExperimentNanoId,
    guest = false,
    experimentList,
}: ExperimentFinishProps) {
    const [disabled, setDisabled] = useState(true);

    const router = useRouter();

    useEffect(() => {
        if (experimentList.length > 0) {
            setDisabled(false);
        } else {
            setDisabled(true);
        }
    }, [experimentList]);

    async function finish() {
        await fetch(getUrl('/api/experiment/finish'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userExperimentNanoId }),
        });
        const resultUrl = guest
            ? `/guest/result/${userExperimentNanoId}`
            : `/result/${userExperimentNanoId}`;
        router.push(resultUrl);
    }

    useEffect(() => {
        const handleBeforeUnload = (event: any) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return (
        <>
            <button className="btn btn-ghost btn-outline" disabled={disabled} onClick={finish}>
                完成写作
            </button>
        </>
    );
}
