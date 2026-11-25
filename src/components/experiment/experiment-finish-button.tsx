'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageResponse } from '@/types/experiment';
import { useExperimentState } from '@/state/_experiment_atoms';
import { Modal } from '../ui/modal';
import { logger } from '@/lib/logger';
import { toast } from '@/hooks/use-toast';

interface ExperimentFinishProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'part'> {
    nanoId: string; // user_experiment表中的nano_id
    disable?: boolean;
    experimentImageList: ImageResponse[];
    callbackUrl: string;
    part: number;
    isExperimentFinished?: boolean;
}

export function ExperimentFinishButton({
    nanoId: userExperimentNanoId,
    experimentImageList: experimentList,
    callbackUrl,
    part,
    isExperimentFinished,
}: ExperimentFinishProps) {
    const [disabled, setDisabled] = useState(true);
    const [open, setOpen] = useState(false);

    const router = useRouter();

    // 判断是否可以完成实验
    useEffect(() => {
        if (experimentList.length > 0) {
            setDisabled(false);
        } else {
            setDisabled(true);
        }
    }, [experimentList]);

    async function finishExperimentStep() {
        try {
            const finished = await useExperimentState
                .getState()
                .finishStep(userExperimentNanoId, part);
            if (!finished) return;
        } catch (error) {
            toast({
                title: '完成写作失败，请重试',
                description: error instanceof Error ? error.message : undefined,
                variant: 'destructive',
            });
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
        </>
    );
}
