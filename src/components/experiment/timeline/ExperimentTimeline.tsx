import { ExperimentStarterButtons } from '@/components/experiment/experiment-starter-buttons';
import { CenteredHero } from '@/components/experiment/modules/centerd-hero';
import { redirect } from 'next/navigation';
import { Icons } from '@/components/icons';
import {
    ExperimentTimelineProps,
    getUserPrivacy,
    getExperiment,
    getExperimentSteps,
    Template,
} from './experiment-timeline';

// 获取实验步骤

export default async function ExperimentTimeline({
    experimentId,
    userId,
}: ExperimentTimelineProps) {
    // 绑定用户的性别和年龄和Qualtrics
    const user = await getUserPrivacy(userId);
    if (!user) {
        redirect('/login');
    }
    let showUserPrivacy = false;
    if (!(user.gender && user.ages)) {
        // 需要用户录入性别数据
        showUserPrivacy = true;
    }

    const experimentData = getExperiment(experimentId);
    const experimentStepData = getExperimentSteps(experimentId);

    // Wait for the promises to resolve
    const [experiment, experimentSteps] = await Promise.all([experimentData, experimentStepData]);
    const title = experiment?.experiment_name || '默认实验';
    const content = experiment.intro || `欢迎参加我们的心理测验。`;

    return (
        <>
            <div className="p-2">
                <ul className="timeline">
                    <li>
                        <hr className="bg-primary" />
                        <div className="timeline-start timeline-box">iPod</div>
                        <div className="timeline-middle">
                            <Icons.checkedRight />
                        </div>
                        <hr />
                    </li>
                    <li>
                        <hr />
                        <div className="timeline-middle">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="timeline-end timeline-box">iPhone</div>
                        <hr />
                    </li>
                </ul>
                <div className="hero">
                    <div className="hero-content text-center">
                        <div className="max-w-md">
                            <CenteredHero title={title} content={content}>
                                <ExperimentStarterButtons
                                    experimentId={experiment?.nano_id || ''}
                                    showUserPrivacy={showUserPrivacy}
                                    userId={userId}
                                />
                            </CenteredHero>
                        </div>
                    </div>
                </div>

                {experimentSteps.map((step, index) => {
                    return <Template key={step.id} step={step} />;
                })}
            </div>
        </>
    );
}
