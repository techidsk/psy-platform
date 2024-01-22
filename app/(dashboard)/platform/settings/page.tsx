import { Icons } from '@/components/icons';
import Image from 'next/image';

/** 平台设置 */
export default function PlatformSetting() {
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
                        <span>开启游客模式</span>
                        <div className="form-control">
                            <label className="label cursor-pointer">
                                <input type="checkbox" className="toggle toggle-primary" />
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span>邀请码</span>
                        <kbd className="kbd kbd-md">8F92aX4F</kbd>
                        <span className="text-gray-600 text-sm">有效期: 2024年7月1日</span>
                        <button className="btn btn-sm">
                            <Icons.refresh />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
