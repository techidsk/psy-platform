'use client';

import { Icons } from '@/components/icons';
import { experiment, experiment_steps } from '@prisma/client';
import { LeftImageHero } from '../modules/left-image-hero';
import { RightImageHero } from '../modules/right-image-hero';
import { CenteredHero } from '../modules/centerd-hero';
import { useState } from 'react';
import { ExperimentStarterButtons } from '../experiment-starter-buttons';

interface ExperimentTimelineProps {
    experiment: experiment;
    experimentSteps: experiment_steps[];
    showUserPrivacy: boolean;
    userId: number;
    guestUserNanoId?: string;
    guest?: boolean;
}

export default function ExperimentStepTimeline({
    experiment,
    experimentSteps,
    showUserPrivacy,
    userId,
    guestUserNanoId,
    guest,
}: ExperimentTimelineProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    // 下一步
    const nextStep = () => {
        if (currentIndex < experimentSteps.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    // 上一步
    const prevStep = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const stepsNum = experimentSteps.length;

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
}: TemplateProps) {
    const title = step?.title || '默认实验';
    const content = step?.content as any;
    const type = step?.type;

    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < stepsNum - 1;
    const isLast = currentIndex === stepsNum - 1;

    function ButtonGroup() {
        return (
            <div className="flex w-full justify-between">
                <div>
                    {hasPrev && (
                        <button className="btn btn-outline" onClick={() => prevStep()}>
                            返回
                        </button>
                    )}
                </div>
                <div>
                    {hasNext && (
                        <button className="btn btn-primary" onClick={() => nextStep()}>
                            确认
                        </button>
                    )}
                    {isLast && (
                        <>
                            <ExperimentStarterButtons
                                experimentId={experimentNanoId}
                                showUserPrivacy={showUserPrivacy}
                                userId={userId}
                                guest={guest}
                                guestUserNanoId={guestUserNanoId}
                            />
                        </>
                    )}
                </div>
            </div>
        );
    }

    switch (type) {
        case 2:
            return (
                <LeftImageHero title={title} content={content?.content} size="lg">
                    <ButtonGroup />
                </LeftImageHero>
            );
        case 3:
            return (
                <RightImageHero title={title} content={content?.content} size="lg">
                    <ButtonGroup />
                </RightImageHero>
            );
        default:
            return (
                <CenteredHero title={title} content={content?.content} size="lg">
                    <ButtonGroup />
                </CenteredHero>
            );
    }
}
