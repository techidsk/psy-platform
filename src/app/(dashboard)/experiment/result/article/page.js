"use client"
import Header from '@/components/header'
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation'
import { GridIcon, FileTextIcon } from '@radix-ui/react-icons'

import { usePreExperimentState } from '@/state/_pre_atoms'

/**预实验输入测试 */
export default function ArticleResult() {
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
                    完成测验
                </h3>
                <div className='text-lg flex flex-col gap-4 mb-8'>
                    <p>
                        感谢您完成了这个测试。根据您的测试过程，我们已经为您生成了以下两种展示方案。这些方案将帮助您更好地了解自己的内心世界，同时也是为了帮助我们更好地了解人类心理。
                    </p>
                    <p>
                        请注意，这个测试的目的是为了帮助您更好地了解自己的情感、想法和行为。因此，请认真地阅读和比较这两种展示方案，并选择您认为最符合您内心世界的那一种。我们相信，您的选择将对您的自我认知和成长产生积极的影响。
                    </p>
                    <p>
                        如果您在选择方案的过程中遇到任何困难或疑问，请不要犹豫，随时向我们寻求帮助和支持。我们将非常乐意为您提供帮助，并希望您能从这个测试中获得实际的收益。
                    </p>
                </div>
                <div className='flex gap-4 w-full justify-center'>
                    <div className='border border-solid border-gray-400 rounded px-8 py-4 cursor-pointer flex flex-col gap-4 justify-center items-center'>
                        <GridIcon height={36} width={36} />
                        <div>画廊模式</div>
                    </div>
                    <div className='border border-solid border-gray-400 rounded px-8 py-4 cursor-pointer flex flex-col gap-4 justify-center items-center'>
                        <FileTextIcon height={36} width={36} />
                        <div>故事模式</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
