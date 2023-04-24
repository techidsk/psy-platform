'use client'
import LoadingSpin from '@/components/common/loading-spin'
import Image from 'next/image';
import { ImageResponse } from '@/types/experiment';
import { useState, useEffect } from 'react';
import { useSettingState } from '@/state/_setting-atoms';
import { Icons } from '../icons';
import { formatTime } from '@/lib/date';


interface ImageListProps extends React.HTMLAttributes<HTMLDivElement> {
    experimentList: ImageResponse[]
}

export function ShowImageList({
    experimentList
}: ImageListProps) {
    const [list, setList] = useState<ImageResponse[]>([])
    const [index, setIndex] = useState(0)
    const [pause, setPause] = useState<boolean>(true)
    const [seconds, setSeconds] = useState<number>(0);
    const [speed, setSpeed] = useState(1)
    const totalLength = (experimentList.length > 1) ? (experimentList[experimentList.length - 1]?.timestamp || 0) - (experimentList[0]?.timestamp || 0) : 0

    const displayNum = useSettingState(state => state.displayNum)
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (!pause) {
                if (seconds >= totalLength) {
                    setPause(true)
                    setSeconds(totalLength)
                    clearInterval(intervalId);
                    return
                }
                setSeconds(seconds => Math.min(seconds + 1 * speed, totalLength));
            }
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [pause, speed, seconds])

    useEffect(() => {
        let temp: ImageResponse[] = experimentList.filter(item => (item.timestamp || 0) < seconds)
            .map((item: ImageResponse, idx: number) => ({ ...item, idx: idx }))
        setList(temp.slice(-1 * displayNum))
        setIndex(experimentList.length)
    }, [experimentList, displayNum, seconds])


    function prev() {
        if (experimentList.length > displayNum) {
            setSliceList(index - 1)
        }
    }

    function next() {
        if (experimentList.length > displayNum) {
            if (index + 1 <= experimentList.length) {
                setSliceList(index + 1)
            }
        }
    }

    function setSliceList(newIndex: number) {
        let tmp = experimentList
        let s = Math.max(newIndex - displayNum, 0)
        let e = Math.min(s + displayNum, experimentList.length)
        setList(tmp.slice(s, e).map((item: ImageResponse, idx: number) => ({ ...item, idx: idx + s })))
        setIndex(Math.max(newIndex, 0))
    }

    function increment() {
        switch (speed) {
            case 1:
                setSpeed(1.5)
                return
            case 1.5:
                setSpeed(2)
                return
            case 2:
                setSpeed(4)
                return
            case 4:
                setSpeed(8)
                return
            case 8:
                setSpeed(16)
                return
        }
    }

    function decrement() {
        switch (speed) {
            case 1.5:
                setSpeed(1)
                return
            case 2:
                setSpeed(1.5)
                return
            case 4:
                setSpeed(2)
                return
            case 8:
                setSpeed(4)
                return
            case 16:
                setSpeed(8)
                return
        }
    }

    return (
        <div className='flex gap-4 w-full flex-col'>
            <div className='flex justify-between w-full items-center'>
                <div className='cursor-pointer' onClick={prev}>
                    <Icons.chevronLeft className="mr-2 h-8 w-8" />
                </div>
                <div className='flex flex-wrap w-full justify-center items-center'>
                    {
                        list.length === 0 &&
                        <div className='basis-1/2 xl:basis-1/4 p-2' >
                            <div className='flex flex-col justify-center items-center rounded border-2 border-slate-300'>
                                <div className='image-holder w-full flex justify-center items-center'>
                                    <div className='w-full h-full flex flex-col gap-8 justify-center items-center'>
                                        <Icons.folder className="mr-2 h-8 w-8" />
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
                                        item.state === 'GENERATING' ? (
                                            <div className='image-holder bg-gray-50 w-full flex justify-center items-center'>
                                                <LoadingSpin />
                                            </div>
                                        ) : (
                                            <Image
                                                className='image-holder'
                                                src={item.image_url}
                                                alt=''
                                                width={512}
                                                height={512}
                                            />
                                        )
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
                    <Icons.chevronRight className="mr-2 h-8 w-8" />
                </div>
            </div>
            <div className='flex flex-col gap-4 justify-center items-center'>
                <h1 className='text-xl text-center select-none'>当前时间戳： {` `}{formatTime(seconds)}{` / `}{formatTime(totalLength)}</h1>
                <div className='flex gap-4 justify-center items-center'>
                    <button className={`btn btn-sm rounded ${pause ? 'btn-primary' : 'btn-ghost btn-outline border-solid'}`} onClick={() => setPause(!pause)}>{pause ? <><Icons.play />开始</> : <><Icons.pause />暂停</>}</button>
                    <div className='flex gap-2 justify-center items-center border border-solid border-gray-800 rounded py-2 px-4'>
                        <Icons.add className='cursor-pointer' onClick={increment} />
                        <h2 className='text-center select-none'>速度 x {speed}</h2>
                        <Icons.minus className='cursor-pointer' onClick={decrement} />
                    </div>
                    <button className='btn btn-sm btn-outline btn-ghost border-solid rounded' onClick={() => setSeconds(0)}><><Icons.rotate />重新开始</></button>
                </div>
            </div>
        </div>
    )
}
