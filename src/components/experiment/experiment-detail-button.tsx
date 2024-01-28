'use client';
// 查看实验详情按钮

import { useState, useEffect } from 'react';
import { usePreExperimentState } from '@/state/_pre_atoms';
import type { experiment as Experiment, experiment_steps } from '@prisma/client';

import { Modal } from '../ui/modal';
import { dateFormat } from '@/lib/date';
import { getUrl } from '@/lib/url';
import { useRouter } from 'next/navigation';

interface ExperimentDetailProps extends React.HTMLAttributes<HTMLButtonElement> {
    experiment: Experiment;
}

interface ExperimentSteps extends experiment_steps {
    content_obj: object;
}

export function ExperimentDetailButton({ experiment }: ExperimentDetailProps) {
    const [open, setOpen] = useState(false);
    const [steps, setSteps] = useState<ExperimentSteps[]>([]);

    const router = useRouter();

    const selectedEngine = usePreExperimentState((state) => state.engine);

    function showDetail() {
        // setOpen(true);
        router.push(`/experiment/${experiment.nano_id}`);
    }

    function handleToggle() {
        setOpen(!open);
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
                const templateJsonString = JSON.stringify(templateJson);
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
        if (open) {
            findSteps();
        }
    }, [open]);

    return (
        selectedEngine && (
            <div className="flex gap-4">
                <button className="btn btn-ghost" onClick={showDetail}>
                    查看详情
                </button>

                <Modal
                    className="flex flex-col gap-4"
                    open={open}
                    onClose={handleToggle}
                    disableClickOutside={!open}
                >
                    <h3 className="font-bold text-lg">实验详情</h3>
                    <div className="flex flex-col gap-2">
                        <span className="text-gray-700">实验名称</span>
                        <span className="text-sm">{experiment.experiment_name}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-gray-700">实验说明</span>
                        <span className="text-sm">{experiment.description}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-gray-700">创建时间</span>
                        <span className="text-sm">
                            {experiment.create_time ? dateFormat(experiment.create_time) : null}
                        </span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-gray-700">实验流程</span>
                        <table className="table table-xs">
                            <thead>
                                <tr>
                                    <th>顺序</th>
                                    <th>步骤类型</th>
                                    <th>标题</th>
                                    {/* <th>内容</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {steps.map((step, index) => (
                                    <tr key={index}>
                                        <td>{step.order}</td>
                                        <td>{step.type}</td>
                                        <td>{step.title}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Modal>
            </div>
        )
    );
}
