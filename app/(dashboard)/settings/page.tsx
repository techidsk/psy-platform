import Image from 'next/image';

/**用户设置界面 */
export default function Settings() {

    return (
        <div className='ml-6 max-w-3xl'>
            <div className='flex flex-col gap-6 items-start min-w-[400px]'>
                <div className='flex gap-4 justify-center items-center'>
                    <Image
                        src='https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar-2.jpg'
                        alt=''
                        height={96}
                        width={96}
                        className='rounded-full'
                    />
                    <div>
                        techidsk
                    </div>
                </div>
                <div className='flex flex-col gap-4'>
                    <div className='flex gap-6'>
                        <label className='text-gray-500 min-w-[144px]'>注册日期</label>
                        <span className='text-gray-800'>2023年11月23日</span>
                    </div>
                </div>
                <div className='flex flex-col gap-4'>
                    <div className='flex gap-6'>
                        <label className='text-gray-500 min-w-[144px]'>Qualtrics账号</label>
                        <span className='text-gray-800'>https://www.qualtrics.com/techidsk</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
