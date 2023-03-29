"use client"
import Header from '@/components/header'
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation'

import { usePreExperimentState } from '@/state/_pre_atoms'

/**预实验输入测试 */
export default function PreInput() {
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const style = usePreExperimentState(state => state.style)
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
        setTimeout(() => {
            setLoading(false);
        }, 3000);
        updateText(text)
        router.push('./experiment/pre-result')
        // todo 回车监听
        // todo 逗号监听
        // todo 发送请求
    }



    return (
        <div className='h-screen bg-white'>
            <Header />
            <div className='container mx-auto px-8 py-8'>
                <h3 className='text-2xl mb-8'>
                    实验说明 ({style})
                </h3>
                <div className='text-lg flex flex-col gap-4 mb-8'>
                    <p>
                        请在下方的文本框内输入您的想法和感受。
                    </p>
                    <p>
                        当您输入文字并点击生成或者按下回车时，我们就会为您生成一张相关的图片。这是一个非常有趣的任务，它可以帮助我们更好地了解您的内心世界。
                    </p>
                </div>
                <div className='flex flex-col gap-8 w-full'>
                    <textarea className={loading ? 'input-textarea read-only' : 'input-textarea'}
                        value={text} onChange={handleChange} onKeyDown={handleKeyDown}
                        readOnly={loading}
                        placeholder='请在文本框内输入，“今天天气真不错”，并按下回车。'
                    />
                    <div className='flex flex-col gap-4 w-full'>
                        <button className={loading ? 'primary-btn btn-md loading' : 'primary-btn btn-md'} disabled={loading} onClick={submit}>提交</button>
                        <Link href='./experiment/start' className='w-full'>
                            <button className='secondary-btn btn-md w-full' disabled={loading}>跳过教程</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
