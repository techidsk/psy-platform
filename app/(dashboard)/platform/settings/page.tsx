import { dayFormat } from '@/lib/date';
import { logger } from '@/lib/logger';
import { getAccessKey } from '@/lib/platform';
import Image from 'next/image';
import RefreshButton from '@/components/platform/refresh-button';
import GuestModeChecker from '@/components/platform/guest-mode-checker';

/** 平台设置 */
export default async function PlatformSetting() {
    const setting = await getAccessKey();
    if (!setting) {
        logger.info(`获取平台设置失败`);
    }

    return (
        <div className="ml-6 max-w-3xl">
            <div className="flex flex-col gap-6 items-start min-w-[400px]">
                <h2 className="text-2xl font-bold">平台设置</h2>
                <div className="flex flex-col gap-4">
                    <h3 className="text-xl">用户基础设置</h3>
                    <div className="flex gap-4 items-center">
                        <span>用户头像</span>
                        <Image
                            className="rounded-full"
                            width={48}
                            height={48}
                            src={
                                'https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar.avif'
                            }
                            alt="默认头像"
                        />
                    </div>
                    <div className="flex gap-4 items-center">
                        <GuestModeChecker />
                    </div>
                    <div className="flex gap-4 items-center">
                        <span>邀请码</span>
                        <kbd className="kbd kbd-md">{setting?.access_key}</kbd>
                        <span className="text-gray-600 text-sm">
                            有效期: {dayFormat(setting?.access_end_date || new Date())}
                        </span>
                        <RefreshButton />
                    </div>
                </div>
            </div>
        </div>
    );
}
