'use client';

import { Icons } from '@/components/icons';
import { experiment, experiment_steps } from '@prisma/client';
import { LeftImageHero } from '../modules/left-image-hero';
import { RightImageHero } from '../modules/right-image-hero';
import { CenteredHero } from '../modules/centerd-hero';
import { useEffect, useState } from 'react';
import { ExperimentStarterButtons } from '../experiment-starter-buttons';
import { ResultPage } from '../modules/result-page';

interface ExperimentTimelineProps {
    experiment: experiment;
    experimentSteps: experiment_steps[];
    showUserPrivacy: boolean;
    userId: number;
    guestUserNanoId?: string;
    guest?: boolean;
    userNanoId: string;
    targetIndex: number;
}

export default function ExperimentStepTimeline({
    experiment,
    experimentSteps,
    showUserPrivacy,
    userId,
    guestUserNanoId,
    guest,
    userNanoId,
    targetIndex,
}: ExperimentTimelineProps) {
    const [currentIndex, setCurrentIndex] = useState(targetIndex || 0);
    const [experimentIndex, setExperimentIndex] = useState(0);
    // 下一步
    const nextStep = () => {
        if (currentIndex < experimentSteps.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    // 上一步
    const prevStep = () => {
        if (currentIndex > 0) {
            let prevIndex = currentIndex - 1;
            // 如果上一步不是实验
            if (experimentSteps[prevIndex].type == 4) {
                return;
            }
            setCurrentIndex(prevIndex);
        }
    };

    const stepsNum = experimentSteps.length;

    useEffect(() => {
        const currentStep = experimentSteps[currentIndex];
        const currentStepId = currentStep.id;
        const writingSteps = experimentSteps.filter((step) => step.type === 4);
        const writingIndex = writingSteps.findIndex((step) => step.id === currentStepId);
        if (writingIndex !== -1) {
            setExperimentIndex(writingIndex + 1);
        }
    }, [currentIndex]);

    let nextExperimentStep = null;
    if (currentIndex + 1 <= experimentSteps.length) {
        nextExperimentStep = experimentSteps[currentIndex + 1];
    }

    return (
        <>
            <div className="mx-4 flex justify-center">
                <ul className="timeline ">
                    {experimentSteps.map((step, index) => {
                        return (
                            <Timelime
                                currentIndex={currentIndex}
                                index={index}
                                step={step}
                                key={step.id}
                            />
                        );
                    })}
                </ul>
            </div>
            <Template
                currentIndex={currentIndex}
                stepsNum={stepsNum}
                step={experimentSteps[currentIndex]}
                nextStep={nextStep}
                prevStep={prevStep}
                showUserPrivacy={showUserPrivacy}
                userId={userId}
                experimentNanoId={experiment.nano_id || ''}
                guest={guest}
                guestUserNanoId={guestUserNanoId}
                userNanoId={userNanoId}
                writingIndex={experimentIndex}
                nextExperimentStep={nextExperimentStep}
            />
        </>
    );
}

interface TimelineProps {
    currentIndex: number;
    index: number;
    step: experiment_steps;
}
function Timelime({ step, currentIndex, index }: TimelineProps) {
    const finished: boolean = currentIndex > index;

    return finished ? (
        <>
            <li>
                <hr className="bg-primary" />
                <div className="timeline-start timeline-box">{step.step_name}</div>
                <div className="timeline-middle">
                    <Icons.checkedRight />
                </div>
                <hr className="bg-primary" />
            </li>
        </>
    ) : (
        <>
            <li>
                <hr />
                <div className="timeline-middle">
                    <Icons.uncheckedRight />
                </div>
                <div className="timeline-end timeline-box">{step.step_name}</div>
                <hr />
            </li>
        </>
    );
}

interface TemplateProps {
    currentIndex: number;
    stepsNum: number;
    step: experiment_steps;
    nextStep: Function;
    prevStep: Function;
    showUserPrivacy: boolean;
    userId: number;
    experimentNanoId: string;
    guest?: boolean;
    guestUserNanoId?: string;
    userNanoId: string;
    writingIndex: number;
    nextExperimentStep: experiment_steps | null;
}

function Template({
    currentIndex,
    stepsNum,
    step,
    nextStep,
    prevStep,
    showUserPrivacy,
    userId,
    experimentNanoId,
    guest,
    guestUserNanoId,
    userNanoId,
    writingIndex,
    nextExperimentStep,
}: TemplateProps) {
    const title = step?.title || '';
    const content = step?.content as any;
    const type = step?.type;

    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < stepsNum - 1;
    const isLast = currentIndex === stepsNum - 1;

    const nextStepIsWriting = nextExperimentStep?.type === 4;

    function ButtonGroup({ type, part_index }: { type?: number; part_index?: number }) {
        return (
            <div className="flex w-full justify-between">
                <div>
                    {hasPrev && !isLast && (
                        <>
                            {
                                <button className="btn btn-outline" onClick={() => prevStep()}>
                                    返回
                                </button>
                            }
                        </>
                    )}
                </div>
                <div>
                    {hasNext && (
                        <>
                            {nextStepIsWriting ? (
                                <>
                                    <ExperimentStarterButtons
                                        experimentId={experimentNanoId}
                                        showUserPrivacy={showUserPrivacy}
                                        userId={userId}
                                        guest={guest}
                                        guestUserNanoId={guestUserNanoId}
                                        action={nextStep}
                                        part={writingIndex}
                                        nextStepIndex={currentIndex + 2}
                                    />
                                </>
                            ) : (
                                <button className="btn btn-primary" onClick={() => nextStep()}>
                                    下一步
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }

    switch (type) {
        // TODO 添加不同流程的操作
        case 1: // 文字
            return (
                <CenteredHero title={title} content={content?.content} size="lg">
                    <ButtonGroup type={type} />
                </CenteredHero>
            );
        case 2: // 左侧图片
            return (
                <LeftImageHero title={title} content={content?.content} size="lg">
                    <ButtonGroup type={type} />
                </LeftImageHero>
            );
        case 3: // 右侧图片
            return (
                <RightImageHero title={title} content={content?.content} size="lg">
                    <ButtonGroup type={type} />
                </RightImageHero>
            );
        case 4: // 写作实验
            return <>写作{`${writingIndex}`}</>;
        case 5: // 跳转服务
            return (
                <ResultPage title={title} content={content} userNanoId={userNanoId} size="lg">
                    <ButtonGroup type={type} />
                </ResultPage>
            );
        case 6: // 表单页面
            return <>Form</>;
        default:
            return (
                <CenteredHero title={title} content={content?.content} size="lg">
                    <ButtonGroup type={0} />
                </CenteredHero>
            );
    }
}
