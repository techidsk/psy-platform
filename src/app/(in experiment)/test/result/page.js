"use client"
import Header from '@/components/header'
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePreExperimentState } from '@/state/_pre_atoms'
import LoadingSpin from '@/components/common/loading-spin'

export default function PreResult() {

    const prompt = usePreExperimentState(state => state.text)
    const [image, setImage] = useState('')
    const [loading, setLoading] = useState(false)

    async function getData() {
        setLoading(true)
        setTimeout(() => {
            setImage('https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/pre-result.jpg')
            setLoading(false)
        }, 3000)
    }

    useEffect(() => {
        getData()
    }, [])

    return (
        <div className='h-screen bg-white'>
            <Header />
            <div className='container mx-auto px-8 py-8'>
                <h3 className='text-2xl lg:text-3xl text-center mb-8'>
                    生成结果
                </h3>
                <div className='flex flex-col gap-8 justify-center items-center'>
                    {
                        loading
                    }
                    {
                        loading
                            ? <div className='flex justify-center items-center border border-solid border-gray-200' style={{ width: 512, height: 512 }}>
                                <LoadingSpin />
                            </div>
                            : <Image
                                className='image-holder'
                                src={image}
                                alt={prompt}
                                width={512}
                                height={512}
                                style={{ maxWidth: 512 }}
                            />
                    }
                    {
                        prompt &&
                        <p className='border rounded border-gray-300 bg-gray-50 px-2 py-4 max-w-xl'>
                            {prompt}
                        </p>
                    }
                    <div className='flex gap-8'>
                        <Link href='./experiment/pre-input'>
                            <button className='btn btn-outline btn-secondary'>继续测试</button>
                        </Link>
                        <Link href='./experiment/start'>
                            <button className='btn btn-primary'>确认</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
