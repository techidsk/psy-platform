"use client"
import Image from 'next/image';
import Header from '@/components/header'
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'
import { ChevronLeftIcon, ChevronRightIcon, MixerHorizontalIcon, Cross2Icon } from '@radix-ui/react-icons'
import LoadingSpin from '@/components/common/loading-spin'
import { useExperimentState } from '@/state/_experiment_atoms'
import Message from '@/components/common/message'
import * as Popover from '@radix-ui/react-popover';
import '../../input/styles.css'

/**预实验输入测试 */
export default function GridResult() {
    const DISPLAY_NUM = 1
    const router = useRouter()
    const imageNumInputRef = useRef(null);

    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState({ title: '', msg: '' })

    const [num, setNum] = useState(DISPLAY_NUM)
    const [maxNum, setMaxNum] = useState(window.innerWidth > 1280 ? 4 : 2);
    const [list, setList] = useState([])
    const [index, setIndex] = useState(0)

    const texts = useExperimentState(state => state.texts)

    useEffect(() => {
        let temp = texts.map((item, idx) => ({ ...item, idx: idx }))
        setList(temp.slice(-1 * num))
        setIndex(texts.length)
    }, [texts, num])

    useEffect(() => {
        const handleResize = () => {
            let n = window.innerWidth > 1280 ? 4 : 2
            setMaxNum(n);
            if (num > n) {
                setNum(n)
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [num])

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

    function saveSettings() {
        let n = imageNumInputRef.current.value
        if (n > 0 && n < maxNum + 1) {
            setNum(n)
        } else {
            setOpen(true)
            setMessage({ title: '输入异常显示数量', msg: `最少显示1张图片，最多显示${maxNum}张图片` })
            setTimeout(() => {
                setOpen(false);
            }, 5000);
            return
        }
    }

    return (
        <div className='h-screen bg-white'>
            <Header />
            <div className='container mx-auto px-8 py-8'>
                <div className='flex flex-col justify-center items-center gap-8 w-full'>
                    <div className='flex justify-between w-full items-center'>
                        <div className='cursor-pointer' onClick={prev}>
                            <ChevronLeftIcon width={32} height={32} />
                        </div>
                        <div className='flex flex-wrap w-full justify-center items-center'>
                            {
                                list.length === 0 &&
                                <div className='basis-1/2 xl:basis-1/4 p-2' >
                                    <div className='flex flex-col justify-center items-center rounded border border-slate-300'>
                                        <div className='image-holder bg-gray-300 w-full flex justify-center items-center'>
                                            <div className='w-full h-full'>                                            </div>
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
                    <div className='flex flex-col gap-4 w-full'>
                        <div className='flex gap-4 flex-row-reverse w-full'>
                            <Popover.Root>
                                <Popover.Trigger asChild>
                                    <button className="" aria-label="Update settings">
                                        <MixerHorizontalIcon />
                                    </button>
                                </Popover.Trigger>
                                <Popover.Portal>
                                    <Popover.Content className="PopoverContent" sideOffset={5}>
                                        <div className='flex flex-col gap-4'>
                                            <p className="Text text-gray-800 text-sm">
                                                设置
                                            </p>
                                            <fieldset className="flex gap-4 items-center">
                                                <label className="w-36 text-xs text-sky-700" htmlFor="image-nums">
                                                    图片显示数量
                                                </label>
                                                <input className="setting-input px-4 py-2" id="image-nums" ref={imageNumInputRef} defaultValue={num} min={1} max={4} />
                                            </fieldset>
                                            <button className='primary-btn btn-sm' onClick={saveSettings}>保存</button>
                                        </div>
                                        <Popover.Close className="PopoverClose" aria-label="Close">
                                            <Cross2Icon />
                                        </Popover.Close>
                                        <Popover.Arrow className="PopoverArrow" />
                                    </Popover.Content>
                                </Popover.Portal>
                            </Popover.Root>
                        </div>
                    </div>
                </div>
            </div>
            {
                open &&
                <Message title={message.title} msg={message.msg} initOpen={open} />
            }
        </div>
    )
}
