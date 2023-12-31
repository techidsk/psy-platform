import Image from 'next/image';

/** 平台设置 */
export default function PlatformSetting() {

    return (
        <div className='ml-6 max-w-3xl'>
            <div className='flex flex-col gap-6 items-start min-w-[400px]'>
                <h2 className='text-2xl font-bold'>平台设置</h2>
                <div className='flex flex-col gap-4'>
                    <h3 className='text-xl'>用户基础设置</h3>
                    <div className='flex gap-4 items-center'>
                        <span>用户头像</span>
                        <Image className='rounded-full' width={48} height={48} src={'https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar.avif'} alt='默认头像' />
                    </div>
                </div>
            </div>
        </div>
    )
}
