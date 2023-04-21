import Image from 'next/image';

/**用户设置界面 */
export default function Settings() {

    return (
        <div className='mx-auto max-w-3xl'>
            <div className='flex gap-6'>
                <div className='flex flex-col gap-4 justify-center items-center'>
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
                <div className='flex flex-col gap-4 border-l border-solid border-gray-200 pl-6'>
                    {
                        [1, 2, 3].map(e => {
                            return <div className='flex gap-6' key={e}>
                                <label className='text-gray-500'>用户名</label>
                                <span className='text-gray-800'>techidsk</span>
                            </div>
                        })
                    }
                </div>
            </div>
        </div>
    )
}
