import { redirect, notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { canEdit } from '@/lib/permissions';
import { getCurrentUser } from '@/lib/session';
import { DEFAULT_IMAGE_SIZE, IMAGE_SIZES, isImageSize } from '@/lib/image-size';
import { logger } from '@/lib/logger';

/** 平台设置 */
async function saveImageSize(data: FormData) {
    'use server';
    if (!canEdit((await getCurrentUser())?.role)) notFound();
    const imageSize = Number(data.get('image_size'));
    if (!isImageSize(imageSize)) throw new Error('图片尺寸无效');
    await db.platform_setting.upsert({
        where: { id: 1 },
        create: { id: 1, image_size: imageSize },
        update: { image_size: imageSize },
    });
    revalidatePath('/platform/settings');
    redirect('/platform/settings?saved=1');
}

export default async function PlatformSetting({
    searchParams,
}: {
    searchParams: Promise<{ saved?: string }>;
}) {
    if (!canEdit((await getCurrentUser())?.role)) notFound();
    const saved = (await searchParams).saved === '1';
    const setting = await db.platform_setting.findUnique({ where: { id: 1 } });
    if (!setting) {
        logger.info(`获取平台设置失败`);
    }

    return (
        <div className="ml-6 max-w-3xl">
            <div className="flex flex-col gap-6 items-start w-full">
                <h2 className="text-2xl font-bold">平台设置</h2>
                <form action={saveImageSize} className="flex flex-wrap items-center gap-3">
                    <label htmlFor="image-size">生成图片尺寸</label>
                    <select
                        id="image-size"
                        name="image_size"
                        className="select select-bordered"
                        defaultValue={setting?.image_size ?? DEFAULT_IMAGE_SIZE}
                    >
                        {IMAGE_SIZES.map((size) => (
                            <option key={size} value={size}>
                                {size} × {size}
                            </option>
                        ))}
                    </select>
                    <button className="btn btn-primary" type="submit">
                        保存
                    </button>
                    {saved && <span role="status">已保存</span>}
                </form>
                <div className="flex flex-col gap-4">
                    <h3 className="text-xl">用户基础设置</h3>
                    <div className="flex gap-4 items-center">
                        <span>用户头像</span>
                        <img
                            className="rounded-full"
                            width={48}
                            height={48}
                            src={
                                'https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar.avif'
                            }
                            alt="默认头像"
                        />
                    </div>
                    {/* <div className="flex gap-4 items-center">
                        <GuestModeChecker />
                    </div> */}
                    {/* <div className="flex gap-4 items-center">
                        <span>邀请码</span>
                        <kbd className="kbd kbd-md">{setting?.access_key}</kbd>
                        <span className="text-gray-600 text-sm">
                            有效期: {dayFormat(setting?.access_end_date || new Date())}
                        </span>
                        <RefreshButton />
                    </div> */}
                </div>
            </div>
        </div>
    );
}
