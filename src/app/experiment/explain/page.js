"use client"
import Header from '@/components/header'
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation'

import { usePreExperimentState } from '@/state/_pre_atoms'

/**预实验输入测试 */
export default function Explain() {
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const updateText = usePreExperimentState(state => state.setText)

    function handleChange(e) {
        if (!loading) {
            const value = e.target.value
            if (value.endsWith("。")) {
                setLoading(true) // submit后改为false
                submit()
            }
            setText(e.target.value)
        }
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // 阻止默认的按键行为
            setLoading(true) // submit后改为false
            submit()
        }
    }

    function submit(e) {
        router.push('./experiment/input')
    }



    return (
        <div className='h-screen bg-white'>
            <Header />
            <div className='container mx-auto px-8 py-8'>
                <h3 className='text-2xl mb-12'>
                    实验说明
                </h3>
                <div className='text-lg flex flex-col gap-4 mb-8'>
                    <p>
                        请在下方的文本框内输入您的想法和感受。
                    </p>
                    <p>
                        如果您感觉愿意分享您的想法和感受，我们非常欢迎您在下面的文本框中写下您的想法和感受。
                    </p>
                </div>
                <div className='flex flex-col justify-center items-center gap-8 w-full'>
                    <Image
                        className='image-holder'
                        style={{ maxWidth: 360 }}
                        src='https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/pre-result.jpg'
                        alt=''
                        width={360}
                        height={360}
                    />
                    <div className='text-2xl'>
                        让我们开始吧。
                    </div>
                    <div className='flex flex-col gap-4'>
                        <button className={loading ? 'primary-btn btn-md loading' : 'primary-btn btn-md'} disabled={loading} onClick={submit}>开始</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
