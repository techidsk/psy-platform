'use client';

import { useEffect, useState } from 'react';

import { Icons } from '@/components/icons';

import type { experiment, experiment_steps, engine as experimentEngine } from '@prisma/client';
import { Modal } from '../ui/modal';
import { ExperimentStepForm } from './experiment-step-form';

interface ExperimentCreateFormProps extends React.HTMLAttributes<HTMLDivElement> {
    experiment?: experiment | null;
    nano_id?: string;
    edit?: boolean;
    engines?: experimentEngine[] | null;
    steps?: experiment_steps[] | null;
    add?: boolean;
    experimentId?: number;
}

export function ExperimentStepTab({
    className,
    experiment,
    nano_id,
    edit,
    engines,
    steps,
    experimentId,
    add = false,
    ...props
}: ExperimentCreateFormProps) {
    const [stepDispatch, setStepDispatch] = useState<string>('CREATE');
    const [experimentSteps, setExperimentSteps] = useState<any[]>([]);

    const [step, setStep] = useState<experiment_steps | null>();

    const [openStepForm, setOpenStepForm] = useState<boolean>(false);

    async function fetchSteps() {
        if (experimentId) {
            const response = await fetch(`/api/experiment/${experimentId}/steps`);
            const data = await response.json();
            setExperimentSteps(data);
        }
    }

    const addSteps = () => {
        setStep(null);
        setStepDispatch('CREATE');
        setOpenStepForm(true);
    };

    const editSteps = (step: experiment_steps) => {
        setStep(step);
        setStepDispatch('UPDATE');
        setOpenStepForm(true);
    };

    async function removeSteps(step: experiment_steps) {
        await fetch(`/api/experiment/steps/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: step.id, experiment_id: experimentId }),
        });
        refreshStepList();
    }

    function refreshStepList() {
        fetchSteps();
    }

    useEffect(() => {
        // 判断是否是编辑模式
        // 如果是编辑模式
        // 则需要保留原有数据，否则显示
        fetchSteps();
    }, []);

    return (
        <>
            <div className="grid gap-2">
                <div className="flex gap-4 items-center justify-between">
                    <label className="text-lg" htmlFor="engine_id">
                        实验步骤
                    </label>
                    <button className="btn btn-sm btn-outline" onClick={() => addSteps()}>
                        <Icons.add size={16} />
                        新增
                    </button>
                </div>
                <div className="flex gap-4">
                    <div className="w-full">
                        <table className="table">
                            {/* head */}
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>类型</th>
                                    <th>步骤标题</th>
                                    <th>步骤详情</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <StepItem
                                    experimentSteps={experimentSteps}
                                    editSteps={editSteps}
                                    removeSteps={removeSteps}
                                />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {openStepForm && experimentId && (
                <Modal
                    className="flex flex-col gap-4"
                    open={openStepForm}
                    onClose={() => setOpenStepForm(false)}
                    disableClickOutside={!open}
                >
                    <ExperimentStepForm
                        step={step}
                        closeModal={() => setOpenStepForm(false)}
                        experimentSteps={experimentSteps}
                        setExperimentSteps={setExperimentSteps}
                        dispatch={stepDispatch}
                        experimentId={experimentId}
                        refreshList={refreshStepList}
                    />
                </Modal>
            )}
        </>
    );
}

interface StepItemProps {
    experimentSteps?: experiment_steps[] | null;
    editSteps: Function;
    removeSteps: Function;
}

function StepItem({ experimentSteps, editSteps, removeSteps }: StepItemProps) {
    return (
        <>
            {experimentSteps && experimentSteps.length > 0 ? (
                <>
                    {experimentSteps?.map((step, index) => {
                        return (
                            <tr key={`${step.type}_${step.step_name}`}>
                                <th>{index + 1}</th>
                                <td>
                                    {step.type && (
                                        <span className="w-20 text-left">
                                            <StepType type={step.type} />
                                        </span>
                                    )}
                                </td>
                                <td>{step.step_name}</td>
                                <td>
                                    {step.type && (
                                        <StepContent type={step.type} content={step.content} />
                                    )}
                                </td>
                                <td>
                                    <StepAction
                                        step={step}
                                        editSteps={editSteps}
                                        removeSteps={removeSteps}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </>
            ) : (
                <div>当前暂无步骤，请手动添加</div>
            )}
        </>
    );
}

function StepAction({
    step,
    editSteps,
    removeSteps,
}: {
    step: experiment_steps;
    editSteps: Function;
    removeSteps: Function;
}) {
    const [openDelete, setOpenDelete] = useState<boolean>(false);
    const openModal = () => setOpenDelete(true);

    const remove = () => {
        removeSteps(step);
        setOpenDelete(false);
    };

    const close = () => setOpenDelete(false);

    return (
        <>
            <div className="flex gap-2 items-center justify-between w-full">
                <div className="flex gap-1">
                    <button className="btn btn-sm btn-ghost" onClick={() => editSteps(step)}>
                        <Icons.edit size={16} />
                        编辑
                    </button>
                    <button className="btn btn-sm btn-ghost" onClick={openModal}>
                        <Icons.delete size={16} />
                        移除
                    </button>
                </div>
            </div>
            {openDelete && (
                <Modal
                    className="flex flex-col gap-4"
                    open={openDelete}
                    onClose={close}
                    disableClickOutside={!openDelete}
                >
                    <div className="grid gap-6">
                        <div className="text-lg flex gap-2 text-red-500">
                            <Icons.alert /> 是否确认删除项目?
                        </div>
                        <div className="flex justify-end gap-4">
                            <button className="btn btn-primary" onClick={remove}>
                                删除
                            </button>
                            <button className="btn" onClick={close}>
                                取消
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}

const StepType = ({ type }: { type: number }) => {
    switch (type) {
        case 1:
            return <span className="badge badge-outline">仅文字</span>;
        case 2:
            return <span className="badge badge-outline">左侧图片</span>;
        case 3:
            return <span className="badge badge-outline">右侧图片</span>;
        case 4:
            return <span className="badge badge-outline">写作实验</span>;
        case 5:
            return <span className="badge badge-outline">跳转服务</span>;
        case 6:
            return <span className="badge badge-outline">表单</span>;
        default:
            return <span className="badge badge-outline">仅文字</span>;
    }
};

const StepContent = ({ type, content }: { type?: number; content: any }) => {
    switch (type) {
        case 1:
            return <></>;
        case 2:
            return <></>;
        case 3:
            return <></>;
        case 4:
            return (
                <div className="flex flex-col gap-2">
                    <div>
                        实验时长：{content.countdown > 0 ? `${content.countdown}分钟` : '不限时'}
                    </div>
                    <div>开启图片：{content.pic_mode ? '开启' : '无图'}</div>
                </div>
            );
        case 5:
            return <div>跳转地址：{content?.redirect_url ? '已配置' : '未配置'}</div>;
        case 6:
            return <span className="badge badge-outline">表单</span>;
        default:
            return <span className="badge badge-outline">仅文字</span>;
    }
};
