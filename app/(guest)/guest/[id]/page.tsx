import { Metadata } from 'next';
import { getId } from '@/lib/nano-id';
import { logger } from '@/lib/logger';
import GuestUniqueKey from '@/components/guest/guest-unique-id';

export const metadata: Metadata = {
    title: '欢迎来到测试平台',
    description: '欢迎来到测试平台',
};
interface GuestVerifyProps {
    params: Promise<{
        id: string; // 游客的nanoId 前16位是 游客的nanoId，后21位是游客的inviteCode
    }>;
    searchParams: Promise<{ [key: string]: string }>;
}

export default async function VerifyPage({
    params,
    searchParams: searchParamsPromise,
}: GuestVerifyProps) {
    const { id } = await params;
    const searchParams = await searchParamsPromise;

    logger.debug(`[访客模式] 访问ID: ${id}`);
    const userUniqueKey = getId();

    const qualtricsId = searchParams['qualtricsId'] || '';

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-white">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[500px]">
                <GuestUniqueKey
                    userUniqueKey={userUniqueKey}
                    inviteCode={id}
                    qualtricsId={qualtricsId}
                    // projectGroupId={projectGroup.id}
                />
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
