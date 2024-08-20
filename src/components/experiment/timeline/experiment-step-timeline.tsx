'use client';

import { Icons } from '@/components/icons';
import { experiment, experiment_steps, user } from '@prisma/client';
import { LeftImageHero } from '../modules/left-image-hero';
import { RightImageHero } from '../modules/right-image-hero';
import { CenteredHero } from '../modules/centerd-hero';
import { useEffect, useState } from 'react';
import { ExperimentStarterButtons } from '../experiment-starter-buttons';
import { ResultPage } from '../modules/result-page';
import { getUrl } from '@/lib/url';

interface ExperimentTimelineProps {
    experiment: experiment;
    experimentSteps: experiment_steps[];
    userId: number;
    guestUserNanoId?: string;
    guest?: boolean;
    userNanoId: string;
    targetStepIndex: number; // 默认是 1
    userExperimentNanoId: string;
    user: user;
}

export default function ExperimentStepTimeline({
    experiment,
    experimentSteps,
    userId,
    guestUserNanoId,
    guest,
    userNanoId,
    targetStepIndex,
    userExperimentNanoId,
    user,
}: ExperimentTimelineProps) {
    const [currentIndex, setCurrentIndex] = useState(targetStepIndex || 1);
    const [showUserPrivacy, setShowUserPrivacy] = useState(false);

    const uniqueKey = user.nano_id || '';
    const qualtricsId = user.qualtrics || '';

    async function fetchUserPrivacy() {
        const result = await fetch(getUrl(`/api/user/privacy/${userId}`), {
            method: 'GET',
        });
        const data = await result.json();

        if (data.gender == null || data.ages == null) {
            // 需要用户录入性别数据
            setShowUserPrivacy(true);
        }
    }

    // 下一步
    const nextStep = () => {
        if (currentIndex < experimentSteps.length) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    // 上一步
    const prevStep = () => {
        if (currentIndex > 1) {
            let prevIndex = currentIndex - 1;
            // 如果上一步不是实验
            if (experimentSteps[prevIndex - 1].type == 4) {
                return;
            }
            setCurrentIndex(prevIndex);
        }
    };

    useEffect(() => {
        // 判断用户是否已经绑定了关键信息
        fetchUserPrivacy();
    }, []);

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
                nextStep={nextStep}
                prevStep={prevStep}
                showUserPrivacy={showUserPrivacy}
                userId={userId}
                experimentNanoId={experiment.nano_id || ''}
                guest={guest}
                guestUserNanoId={guestUserNanoId}
                userNanoId={userNanoId}
                experimentSteps={experimentSteps}
                userExperimentNanoId={userExperimentNanoId}
                uniqueKey={uniqueKey}
                qualtricsId={qualtricsId}
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
    currentIndex: number; // 从 1 开始
    nextStep: Function;
    prevStep: Function;
    showUserPrivacy: boolean;
    userId: number;
    experimentNanoId: string;
    guest?: boolean;
    guestUserNanoId?: string;
    userNanoId: string;
    experimentSteps: experiment_steps[]; // 总实验步数
    userExperimentNanoId: string;
    uniqueKey: string;
    qualtricsId: string;
}

function Template({
    currentIndex,
    nextStep,
    prevStep,
    showUserPrivacy,
    userId,
    experimentNanoId,
    guest,
    guestUserNanoId,
    userNanoId,
    experimentSteps,
    userExperimentNanoId,
    uniqueKey,
    qualtricsId,
}: TemplateProps) {
    const totalStepNum = experimentSteps.length;
    const currentStep = experimentSteps[currentIndex - 1];

    const title = currentStep?.title || '';
    const content = currentStep?.content as any;
    const type = currentStep?.type;

    // 判断是否有返回和下一步
    // 如果有上一步，而且上一步为实验，则没有返回上一步选项
    // 如果下一步为写作实验，则没有下一步选项
    // 如果是最后一步了，没有下一步选项

    // 是否有上一步和下一步
    const hasPrev = currentIndex > 1;
    const hasNext = currentIndex < totalStepNum;

    const isLast = currentIndex === totalStepNum;

    const isPrevStepWriting = experimentSteps[currentIndex - 2]?.type === 4;
    const isNextStepWriting = experimentSteps[currentIndex]?.type === 4;

    function ButtonGroup() {
        return (
            <div className="flex w-full justify-between">
                <div>
                    {hasPrev && !isPrevStepWriting && !isLast && (
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
                            {isNextStepWriting ? (
                                <>
                                    <ExperimentStarterButtons
                                        experimentId={experimentNanoId}
                                        showUserPrivacy={showUserPrivacy}
                                        userId={userId}
                                        guest={guest}
                                        guestUserNanoId={guestUserNanoId}
                                        action={nextStep}
                                        currentStepIndex={currentIndex + 1}
                                        nextStepIndex={currentIndex + 2}
                                        userExperimentNanoId={userExperimentNanoId}
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
        case 1: // 文字
            return (
                <CenteredHero title={title} content={content?.content} size="lg">
                    <ButtonGroup />
                </CenteredHero>
            );
        case 2: // 左侧图片
            return (
                <LeftImageHero title={title} content={content?.content} size="lg">
                    <ButtonGroup />
                </LeftImageHero>
            );
        case 3: // 右侧图片
            return (
                <RightImageHero title={title} content={content?.content} size="lg">
                    <ButtonGroup />
                </RightImageHero>
            );
        case 4: // 写作实验
            return <>写作</>;
        case 5: // 跳转服务
            return (
                <ResultPage
                    title={title}
                    content={content}
                    userNanoId={userNanoId}
                    userExperimentNanoId={userExperimentNanoId}
                    uniqueKey={uniqueKey}
                    qualtricsId={qualtricsId}
                    size="lg"
                >
                    <ButtonGroup />
                </ResultPage>
            );
        case 6: // 表单页面
            return <>Form</>;
        default:
            return (
                <CenteredHero title={title} content={content?.content} size="lg">
                    <ButtonGroup />
                </CenteredHero>
            );
    }
}
