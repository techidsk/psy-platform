"use client"
import { useState } from 'react'
import Header from '@/components/header'
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Message from '@/components/common/message'

import { usePreExperimentState } from '@/state/_pre_atoms'
import { useExperimentState } from '@/state/_experiment_atoms'

// 实验开始
export default function Start() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState({ title: '', msg: '' })

    const style = usePreExperimentState(state => state.style)
    const updateExperimentStyle = useExperimentState(state => state.selectStyle)

    function start() {
        if (style) {
            updateExperimentStyle(style)
            router.push('./experiment/explain')
        } else {
            setOpen(true)
            setMessage({ title: '未选择样式', msg: '请重新开始测验' })
            setTimeout(() => {
                setOpen(false);
            }, 5000);
        }
    }

    return (
        <div className='h-screen bg-white'>
            <Header />
            <div className='container mx-auto px-8 py-8 flex flex-col justify-center items-center gap-12'>
                <div className='text-lg flex flex-col gap-6 max-w-xl justify-center'>
                    <p>
                        欢迎参加我们的心理测验。在这个测验中，您将被要求在我们的文本框内畅所欲言，分享您的想法和感受。您可以使用回车或者句号做为结尾，我们会为您生成一张图片。请注意，您不需要等待图片的生成，可以尽情输入，直到您感觉已经表达了您的内心世界。
                    </p>
                    <p>
                        在这个测验中，我们希望了解您的情感、想法和行为。您的回答将被用于研究和分析，以帮助我们更好地了解人类心理。请放心地表达您的内心世界，我们会认真听取并理解您的每一个诉求。
                    </p>
                    <p>
                        当您输入完毕后，点击完成即可完成测验。请注意，您的个人信息和数据将被严格保密，只有研究团队成员才能访问它们。如果您有任何疑问或意见，请随时与我们联系。感谢您的参与！
                    </p>
                </div>
                <div className='flex gap-8 justify-center items-center w-96'>
                    <div className='text-xl font-bold'>
                        您选择的风格
                    </div>
                    <Image
                        className='image-holder basis-1/2'
                        style={{ maxWidth: 96 }}
                        src='https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/pre-result.jpg'
                        alt=''
                        width={96}
                        height={96}
                    />
                </div>
                <div className='flex justify-center items-center gap-8'>
                    <Link href='./experiment/pre-style'>
                        <button className='secondary-btn image-btn'>切换风格</button>
                    </Link>
                    <button className='primary-btn image-btn' onClick={start}>确认</button>
                </div>
            </div>
            {
                open &&
                <Message title={message.title} msg={message.msg} initOpen={open} />
            }
        </div >
    )
}
