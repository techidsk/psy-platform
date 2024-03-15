import { Metadata } from 'next';
import { db } from '@/lib/db';
import { notFound, redirect } from 'next/navigation';
import { getId } from '@/lib/nano-id';
import { GuestExperimentStarterButtons } from '@/components/guest/guest-experiment-starter-buttons';

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
        console.log('未找到实验配置');
        return null;
    }

    return experiment;
}

async function addUserExperiment(experimentId: number, engineId: number, userId: number) {
    const experimentNanoId = getId();
    await db.user_experiments.create({
        data: {
            experiment_id: `${experimentId}`,
            nano_id: experimentNanoId,
            engine_id: engineId,
            type: 'GUEST_EXPERIMENT',
            user_id: userId,
        },
    });
    return experimentNanoId;
}

async function insertGuestUser(nanoId: string) {
    // 判断是否有用户存在
    const guestUser = await db.user.findFirst({
        where: {
            nano_id: nanoId,
        },
    });
    if (guestUser) {
        return guestUser;
    }

    const user = await db.user.create({
        data: {
            nano_id: nanoId,
            user_role: 'GUEST',
            username: nanoId,
        },
    });
    return user;
}

export default async function VerifyPage({ params: { id } }: { params: { id: string } }) {
    const platfomrSetting = await getAccessKey();

    // 未开放游客模式
    if (platfomrSetting?.guest_mode === false) {
        console.error('Guest Mode is not open');
        return notFound();
    }
    // 游客模式已经结束
    if (
        platfomrSetting?.access_end_date &&
        new Date(platfomrSetting?.access_end_date) < new Date()
    ) {
        console.error('Guest Mode is over');
        return notFound();
    }
    // 游客模式ID不匹配
    if (id !== platfomrSetting?.access_key) {
        console.error("ID doesn't match", id, platfomrSetting?.access_key);
        return notFound();
    }

    const experimentIds = (platfomrSetting.guest_experiment_ids as number[]) || [];
    if (experimentIds.length === 0) {
        console.error('No experiment id');
        return notFound();
    }

    const experimentId = experimentIds[Math.floor(Math.random() * experimentIds.length)];
    const experiment = await getExperiment(experimentId);
    // 未绑定引擎
    if (experiment?.engine_id == null || experiment.engine_id == undefined) {
        console.error("Experiment doesn't bind engine");
        return notFound();
    }
    const userUniqueKey = getId();
    // const guest = await insertGuestUser(userUniqueKey);
    // console.log('创建临时用户id: ', guest.id);

    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-white">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-4 text-center">
                    <h1 className="text-4xl font-semibold tracking-tight">欢迎参加本次实验</h1>
                    <div className="text text-slate-500 dark:text-slate-400">
                        这是您本次实验的唯一ID{'  '}
                        <kbd className="kbd kbd-md">{userUniqueKey}</kbd>
                        请牢记在心
                    </div>
                </div>
                <div className="px-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    <GuestExperimentStarterButtons
                        experimentId={experimentId}
                        userUniqueKey={userUniqueKey}
                        engineId={experiment?.engine_id}
                    />
                </div>
            </div>
        </div>
    );
}
