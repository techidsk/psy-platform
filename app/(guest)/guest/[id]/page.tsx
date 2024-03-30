import { Metadata } from 'next';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { getId } from '@/lib/nano-id';
import { logger } from '@/lib/logger';
import GuestUniqueKey from '@/components/guest/guest-unique-id';

export const metadata: Metadata = {
    title: '欢迎来到测试平台',
    description: '欢迎来到测试平台',
};

async function getAccessKey() {
    const setting = await db.platform_setting.findFirst({});

    if (!setting) {
        console.log('未找到平台配置');
        return null;
    }

    return setting;
}

async function getExperiment(experimentId: number) {
    const experiment = await db.experiment.findFirst({
        where: {
            id: experimentId,
        },
    });

    if (!experiment) {
        logger.error('未找到实验配置');
        return null;
    }

    return experiment;
}

export default async function VerifyPage({ params: { id } }: { params: { id: string } }) {
    const platfomrSetting = await getAccessKey();

    // 未开放游客模式
    if (platfomrSetting?.guest_mode === false) {
        logger.error('Guest Mode is not open');
        return notFound();
    }
    // 游客模式已经结束
    if (
        platfomrSetting?.access_end_date &&
        new Date(platfomrSetting?.access_end_date) < new Date()
    ) {
        logger.error('Guest Mode is over');
        return notFound();
    }
    // 游客模式ID不匹配
    if (id !== platfomrSetting?.access_key) {
        logger.error("ID doesn't match", id, platfomrSetting?.access_key);
        return notFound();
    }

    const experimentIds = (platfomrSetting.guest_experiment_ids as number[]) || [];
    if (experimentIds.length === 0) {
        logger.error('No experiment id');
        return notFound();
    }

    // 随机选择对应的实验
    const experimentId = experimentIds[Math.floor(Math.random() * experimentIds.length)];
    const experiment = await getExperiment(experimentId);
    // 未绑定引擎
    const engineIds = experiment?.engine_ids as number[];
    if (engineIds.length === 0) {
        logger.error(`[实验${experimentId}] 未绑定生成引擎`);
        return notFound();
    }

    const userUniqueKey = getId();

    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-white">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <GuestUniqueKey userUniqueKey={userUniqueKey} />
                {/* <div className="px-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    <GuestExperimentStarterButtons
                        experimentId={experimentId}
                        userUniqueKey={userUniqueKey}
                        engineId={experiment?.engine_id}
                    />
                </div> */}
            </div>
        </div>
    );
}
