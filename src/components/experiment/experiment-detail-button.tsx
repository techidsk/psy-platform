'use client';
// 查看实验详情按钮

import { useState, useEffect } from 'react';
import { usePreExperimentState } from '@/state/_pre_atoms';
import type { experiment as Experiment, experiment_steps } from '@prisma/client';

import { Modal } from '../ui/modal';
import { dateFormat } from '@/lib/date';
import { getUrl } from '@/lib/url';
import { useRouter } from 'next/navigation';
import { Icons } from '../icons';
import { ExperimentDeleteModal } from './experiment-delete-modal';

interface ExperimentDetailProps extends React.HTMLAttributes<HTMLButtonElement> {
    experiment: Experiment;
}

interface ExperimentSteps extends experiment_steps {
    content_obj: object;
}

export function ExperimentDetailButton({ experiment }: ExperimentDetailProps) {
    const [openDelete, setOpenDelete] = useState(false);
    const [steps, setSteps] = useState<ExperimentSteps[]>([]);

    const router = useRouter();

    const selectedEngine = usePreExperimentState((state) => state.engine);

    function showDetail() {
        router.push(`/experiment/${experiment.nano_id}`);
    }

    function handleDeleteToggle() {
        setOpenDelete(!openDelete);
    }

    function closeDeleteModal() {
        setOpenDelete(false);
        router.refresh();
    }

    /**
     * 获取实验的分步流程
     */
    async function findSteps() {
        await fetch(getUrl('/api/experiment/steps'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                experiment_id: experiment.id,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                const templateJson = data?.content;
                const templateJsonString = JSON.stringify(templateJson) || '';
                if (!templateJsonString) {
                    return;
                }
                console.log(templateJsonString);
                const content = JSON.parse(templateJsonString);
                setSteps({
                    ...data,
                    content_obj: {
                        ...content,
                        content: content?.content || '',
                    },
                });
            });
    }

    useEffect(() => {
        if (openDelete) {
            findSteps();
        }
    }, [openDelete]);

    return (
        selectedEngine && (
            <>
                <div className="flex gap-2">
                    <button
                        className="btn btn-outline btn-primary btn-sm"
                        onClick={() => setOpenDelete(true)}
                    >
                        <Icons.delete />
                        删除
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={showDetail}>
                        查看详情
                    </button>
                </div>

                <Modal
                    className="flex flex-col gap-4"
                    open={openDelete}
                    onClose={handleDeleteToggle}
                    disableClickOutside={!openDelete}
                >
                    <h1 className="text-xl">删除项目</h1>
                    <ExperimentDeleteModal
                        closeModal={closeDeleteModal}
                        experimentId={experiment.id}
                    />
                </Modal>
            </>
        )
    );
}
