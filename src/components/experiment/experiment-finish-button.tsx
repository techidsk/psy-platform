'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageResponse } from '@/types/experiment';
import { getUrl } from '@/lib/url';
import { Modal } from '../ui/modal';
import { logger } from '@/lib/logger';
import StringHTML from './modules/string-to-html';
import { Icons } from '../icons';
import { toast } from '@/hooks/use-toast';

interface ExperimentFinishProps extends React.HTMLAttributes<HTMLButtonElement> {
    nanoId: string; // user_experiment表中的nano_id
    disable?: boolean;
    experimentList: ImageResponse[];
    callbackUrl: string;
    part: number;
    stepTitle?: string;
    stepContent?: string;
    isExperimentFinished?: boolean;
}

export function ExperimentFinishButton({
    nanoId: userExperimentNanoId,
    experimentList,
    callbackUrl,
    part,
    stepTitle,
    stepContent,
    isExperimentFinished,
}: ExperimentFinishProps) {
    const [disabled, setDisabled] = useState(true);
    const [open, setOpen] = useState(false);
    const [openHint, setOpenHint] = useState(false);

    const router = useRouter();

    useEffect(() => {
        if (experimentList.length > 0) {
            setDisabled(false);
        } else {
            setDisabled(true);
        }
    }, [experimentList]);

    async function finishExperimentStep() {
        // 完成写作
        const result = await fetch(getUrl('/api/experiment/finish'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: userExperimentNanoId, part: part }),
        });

        if (!result.ok) {
            toast({
                title: '未完成写作任务',
                description: `未找到任何写作内容，请重新实验`,
                variant: 'destructive',
                duration: 3000,
            });
            router.back();
            return;
        }

        const decodeUrl = decodeURIComponent(callbackUrl);
        logger.info(`用户点击完成，跳转到${decodeUrl}`);
        router.replace(decodeUrl);
    }

    function goNext() {
        const decodeUrl = decodeURIComponent(callbackUrl);
        logger.info(`用户点击完成，跳转到${decodeUrl}`);
        router.push(decodeUrl);
    }

    function close() {
        setOpen(false);
    }

    function closeHint() {
        setOpenHint(false);
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
            <div className="flex gap-2">
                {isExperimentFinished ? (
                    <button
                        className="btn btn-primary"
                        disabled={disabled}
                        onClick={() => goNext()}
                    >
                        下一步
                    </button>
                ) : (
                    <button
                        className="btn btn-primary"
                        disabled={disabled}
                        onClick={() => setOpen(true)}
                    >
                        完成写作
                    </button>
                )}
                {(stepTitle || stepContent) && (
                    <button
                        className="btn btn-ghost btn-outline"
                        disabled={disabled}
                        onClick={() => setOpenHint(true)}
                    >
                        <Icons.help />
                    </button>
                )}
            </div>

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
                        <button className="btn btn-primary" onClick={finishExperimentStep}>
                            确认
                        </button>
                        <button className="btn btn-ghost" onClick={close}>
                            取消
                        </button>
                    </div>
                </Modal>
            )}

            {openHint && (
                <Modal
                    className="flex flex-col gap-4"
                    open={openHint}
                    onClose={closeHint}
                    disableClickOutside={!openHint}
                >
                    <h1 className="text-xl">{stepTitle}</h1>
                    <StringHTML htmlString={stepContent ?? ''} margin={false} />
                    <div className="flex gap-4 flex-row-reverse">
                        <button className="btn btn-ghost" onClick={closeHint}>
                            返回
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}
