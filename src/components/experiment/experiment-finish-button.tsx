'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageResponse } from '@/types/experiment';
import { getUrl } from '@/lib/url';
import { Modal } from '../ui/modal';
import { logger } from '@/lib/logger';

interface ExperimentFinishProps extends React.HTMLAttributes<HTMLButtonElement> {
    nanoId: string; // user_experiment表中的nano_id
    disable?: boolean;
    guest?: boolean;
    experimentList: ImageResponse[];
    callbackUrl: string;
    nextStepIndex: number;
}

export function ExperimentFinishButton({
    nanoId: userExperimentNanoId,
    guest = false,
    experimentList,
    callbackUrl,
    nextStepIndex,
}: ExperimentFinishProps) {
    const [disabled, setDisabled] = useState(true);
    const [open, setOpen] = useState(false);

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
            body: JSON.stringify({ id: userExperimentNanoId, part: nextStepIndex - 1 }),
        });
        const resultUrl = guest
            ? `/guest/result/${userExperimentNanoId}`
            : `/result/${userExperimentNanoId}`;

        const decodeUrl = decodeURIComponent(callbackUrl);
        logger.info(`跳转到${decodeUrl}`);
        router.push(decodeUrl);
    }

    function close() {
        setOpen(false);
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
            <button
                className="btn btn-ghost btn-outline"
                disabled={disabled}
                onClick={() => setOpen(true)}
            >
                完成写作
            </button>

            {open && (
                <Modal
                    className="flex flex-col gap-4"
                    open={open}
                    onClose={close}
                    disableClickOutside={!open}
                >
                    <h1 className="text-xl">完成写作</h1>
                    <div>
                        <p>您确定已经完成了所有的写作吗？</p>
                        <p>点击确认后，将无法再次编辑。</p>
                    </div>
                    <div className="flex gap-4 flex-row-reverse">
                        <button className="btn btn-primary" onClick={finish}>
                            确认
                        </button>
                        <button className="btn btn-ghost" onClick={close}>
                            取消
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}
