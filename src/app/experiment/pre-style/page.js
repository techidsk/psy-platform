"use client"
import Header from '@/components/header'
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { usePreExperimentState } from '@/state/_pre_atoms'


export default function PreStyle() {
    const router = useRouter()
    const updateStyle = usePreExperimentState(state => state.selectStyle)

    function select(style) {
        updateStyle(style)
        router.push('./experiment/pre-input')
    }

    return (
        <div className='h-screen bg-white'>
            <Header />
            <div className='container mx-auto px-8 py-8'>
                <h3 className='text-2xl lg:text-3xl text-center mb-8'>
                    请在以下三种图片中选择最令您感到舒适的图片
                </h3>
                <div className='columns-3 gap-8'>
                    <div className='image-item'>
                        <Image
                            className='image-holder'
                            src='https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/style1.webp'
                            alt="Picture of the author"
                            width={512}
                            height={512}
                        />
                        <button className='image-btn' onClick={() => select(1)}>选择</button>
                    </div>
                    <div className='image-item' >
                        <Image
                            className='image-holder'
                            src='https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/style1.webp'
                            alt="Picture of the author"
                            width={512}
                            height={512}
                        />
                        <button className='image-btn' onClick={() => select(2)}>选择</button>
                    </div>
                    <div className='image-item'>
                        <Image
                            className='image-holder'
                            src='https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/style1.webp'
                            alt="Picture of the author"
                            width={512}
                            height={512}
                        />
                        <button className='image-btn' onClick={() => select(3)}>选择</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
