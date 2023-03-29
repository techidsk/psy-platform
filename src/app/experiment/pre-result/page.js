"use client"
import Header from '@/components/header'
import Image from 'next/image';
import Link from 'next/link';
import { usePreExperimentState } from '@/state/_pre_atoms'

export default function PreResult() {

    const prompt = usePreExperimentState(state => state.text)

    return (
        <div className='h-screen bg-white'>
            <Header />
            <div className='container mx-auto px-8 py-8'>
                <h3 className='text-2xl lg:text-3xl text-center mb-8'>
                    生成结果
                </h3>
                <div className='flex flex-col gap-8 justify-center items-center'>
                    <Image
                        className='image-holder'
                        src='https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/pre-result.jpg'
                        alt={prompt}
                        width={512}
                        height={512}
                    />
                    {
                        prompt &&
                        <p className='border rounded border-gray-300 bg-gray-50 px-2 py-4 max-w-xl'>
                            {prompt}
                        </p>
                    }
                    <div className='flex gap-8'>
                        <Link href='./experiment/pre-input'>
                            <button className='secondary-btn image-btn'>继续测试</button>
                        </Link>
                        <Link href='./experiment/start'>
                            <button className='primary-btn image-btn'>确认</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
