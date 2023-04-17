"use client"
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useExperimentState } from '@/state/_experiment_atoms'
import { ChevronLeftIcon, ChevronRightIcon, FileIcon } from '@radix-ui/react-icons'
import LoadingSpin from '@/components/common/loading-spin'
import './styles.css';



// 获取用户提交的图片内容
async function getImages() {

}

/**预实验输入测试 */
export default function ImageList({ num }) {
    const [list, setList] = useState([])
    const [index, setIndex] = useState(0)

    const texts = useExperimentState(state => state.texts)

    useEffect(() => {
        let temp = texts.map((item, idx) => ({ ...item, idx: idx }))
        setList(temp.slice(-1 * num))
        setIndex(texts.length)
    }, [texts, num])



    function prev() {
        if (texts.length > parseInt(num)) {
            setSliceList(index - 1)
        }
    }

    function next() {
        if (texts.length > parseInt(num)) {
            if (index + 1 <= texts.length) {
                setSliceList(index + 1)
            }
        }
    }

    function setSliceList(newIndex) {
        let tmp = texts
        let s = Math.max(newIndex - parseInt(num), 0)
        let e = Math.min(s + parseInt(num), texts.length)
        setList(tmp.slice(s, e).map((item, idx) => ({ ...item, idx: idx + s })))
        setIndex(Math.max(newIndex, 0))
    }

    return (
        <div className='flex justify-between w-full items-center'>
            <div className='cursor-pointer' onClick={prev}>
                <ChevronLeftIcon width={32} height={32} />
            </div>
            <div className='flex flex-wrap w-full justify-center items-center'>
                {
                    list.length === 0 &&
                    <div className='basis-1/2 xl:basis-1/4 p-2' >
                        <div className='flex flex-col justify-center items-center rounded border-2 border-slate-300'>
                            <div className='image-holder w-full flex justify-center items-center'>
                                <div className='w-full h-full flex flex-col gap-8 justify-center items-center'>
                                    <FileIcon className='text-gray-400' width={72} height={72} />
                                    <div className='text-gray-400'>暂无历史内容</div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {
                    list.map(item => {
                        return <div key={item.id} className='basis-1/2 xl:basis-1/4 p-2' >
                            <div className='flex flex-col justify-center items-center rounded border border-slate-300'>
                                {
                                    item.loading ?
                                        <Image
                                            className='image-holder'
                                            src={item.url}
                                            alt=''
                                            width={512}
                                            height={512}
                                        /> :
                                        <div className='image-holder bg-gray-50 w-full flex justify-center items-center'>
                                            <LoadingSpin />
                                        </div>
                                }
                                {
                                    item.prompt &&
                                    <p className='border-t w-full border-slate-300 bg-gray-50 px-2 py-4 max-w-xl text-xs text-gray-600'>
                                        <span className='text-gray-900'>{item.idx + 1}: </span> {item.prompt}
                                    </p>
                                }
                            </div>
                        </div>
                    })
                }
            </div>
            <div className='cursor-pointer' onClick={next}>
                <ChevronRightIcon width={32} height={32} />
            </div>
        </div>
    )
}
