import { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { getId } from '@/lib/nano-id';

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

async function getExpermentNanoId(experimentId: number) {
    const experiment = await db.experiment.findFirst({
        where: {
            id: experimentId,
        },
    });

    if (!experiment) {
        console.log('未找到实验配置');
        return null;
    }

    return experiment.nano_id;
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
    const experimentNanoId = await getExpermentNanoId(experimentId);
    const userUniqueKey = getId();

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
                <p className="px-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    <Link
                        href={`/guest/input/${userUniqueKey}?e=${experimentNanoId}`}
                        className="btn btn-primary"
                    >
                        现在开始
                    </Link>
                </p>
            </div>
        </div>
    );
}
