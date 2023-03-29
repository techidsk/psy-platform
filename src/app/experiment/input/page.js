"use client"
import Header from '@/components/header'
import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'
import Message from '@/components/common/message'
import { useExperimentState } from '@/state/_experiment_atoms'
import { ChevronLeftIcon, ChevronRightIcon, MixerHorizontalIcon, Cross2Icon } from '@radix-ui/react-icons'
import * as Popover from '@radix-ui/react-popover';
import LoadingSpin from '@/components/common/loading-spin'
import './styles.css';

/**预实验输入测试 */
export default function Input() {
    const MIN_CHAR = 5
    const DISPLAY_NUM = 1

    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)

    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState({ title: '', msg: '' })

    const [num, setNum] = useState(DISPLAY_NUM)
    const [maxNum, setMaxNum] = useState(window.innerWidth > 1280 ? 4 : 2);
    const [list, setList] = useState([])
    const [index, setIndex] = useState(0)
    const imageNumInputRef = useRef(null);

    const router = useRouter()
    const updateTexts = useExperimentState(state => state.addTexts)
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
    }, [])


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


    function handleChange(e) {
        if (!loading) {
            const value = e.target.value
            if (value.endsWith("。")) {
                submit()
            }
            setText(e.target.value)
        }
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // 阻止默认的按键行为
            submit()
        }
    }

    function submit(e) {
        if (text.length < MIN_CHAR) {
            setOpen(true)
            setMessage({ title: '字数未满足要求', msg: `请至少输入${MIN_CHAR}个字符，当前已输入${text.length}` })
            setTimeout(() => {
                setOpen(false);
            }, 5000);
            return
        }
        setLoading(true) // submit后改为false
        setTimeout(() => {
            setLoading(false);
        }, 1000);
        const randomNumber = Math.floor(Math.random() * 5) + 1;
        const randomStatus = Math.random() > 0.5
        const item = {
            id: new Date().getTime(),
            prompt: text,
            url: `https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/result-${randomNumber}.jpg`,
            loading: randomStatus
        }
        updateTexts(item)
        // 成功之后清空textarea
        setText('')

        // todo 回车监听
        // todo 逗号监听
        // todo 发送请求
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

    function finish() {
        // 提交后直接跳转到结果页面 等待图片处理完毕
        router.push('./experiment/result')
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
                    <textarea className={loading ? 'input-textarea read-only' : 'input-textarea'}
                        value={text} onChange={handleChange} onKeyDown={handleKeyDown}
                        // readOnly={loading}
                        placeholder='请在文本框内输入，“今天天气真不错”，并按下回车。'
                    />
                    <div className='flex flex-col gap-4 w-full'>
                        <div className='flex gap-4 flex-row-reverse w-full'>
                            <button className={loading ? 'primary-btn btn-md loading w-48' : 'primary-btn btn-md w-48'} disabled={loading} onClick={submit}>发送</button>
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
                        <div className='flex gap-4 flex-row-reverse w-full'>
                            <Dialog.Root>
                                <Dialog.Trigger asChild>
                                    <button className={'secondary-btn btn-md w-48'} onClick={() => console.log('完成')}>完成测验</button>
                                </Dialog.Trigger>
                                <Dialog.Portal>
                                    <Dialog.Overlay className="DialogOverlay" />
                                    <Dialog.Content className="DialogContent">
                                        <Dialog.Title className="DialogTitle">确认提交</Dialog.Title>
                                        <Dialog.Description className="DialogDescription">
                                            您是否确定提交测验？提交后无法再次编辑。
                                        </Dialog.Description>
                                        <Dialog.Close asChild>
                                            <div className="flex gap-4 justify-end">
                                                <button className='secondary-btn btn-sm'>
                                                    继续编辑
                                                </button>
                                                <button className='primary-btn btn-sm' onClick={finish}>
                                                    确认提交
                                                </button>
                                            </div>
                                        </Dialog.Close>
                                    </Dialog.Content>
                                </Dialog.Portal>
                            </Dialog.Root>
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
