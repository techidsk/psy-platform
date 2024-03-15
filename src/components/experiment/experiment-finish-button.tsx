'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageResponse } from '@/types/experiment';
import { getUrl } from '@/lib/url';

interface ExperimentFinishProps extends React.HTMLAttributes<HTMLButtonElement> {
    nanoId: string;
    disable?: boolean;
    guest?: boolean;
    experimentList: ImageResponse[];
}

export function ExperimentFinishButton({
    nanoId,
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
        // 完成实验
        await fetch(getUrl('/api/experiment/finish'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: nanoId,
            }),
        });
        const resultUrl = guest ? `/guest/result/${nanoId}` : `/result/${nanoId}`;

        router.push(resultUrl);
    }

    return (
        <button className="btn btn-ghost btn-outline" disabled={disabled} onClick={finish}>
            完成实验
        </button>
    );
}
