'use client'
import { ChevronLeftIcon, ChevronRightIcon, FileIcon } from '@radix-ui/react-icons'
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
    const totalLength = (experimentList.length > 1) ? (experimentList[experimentList.length - 1]?.timestamp || 0) - (experimentList[0]?.timestamp || 0) : 0

    const displayNum = useSettingState(state => state.displayNum)
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (!pause) {
                if (seconds >= totalLength) {
                    setPause(true)
                    clearInterval(intervalId);
                    return
                }
                setSeconds(seconds => seconds + 1);
            }
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [pause])

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

    return (
        <div className='flex gap-4 w-full flex-col'>
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
                    <ChevronRightIcon width={32} height={32} />
                </div>
            </div>
            <div className='flex gap-4 justify-center items-center'>
                <h1 className='text-xl text-center'>当前时间戳： {` `}{formatTime(seconds)}{` / `}{formatTime(totalLength)}</h1>
                <button className={`btn btn-sm ${pause ? 'btn-primary' : 'btn-ghost btn-outline'}`} onClick={() => setPause(!pause)}>{pause ? <><Icons.play />开始</> : <><Icons.pause />暂停</>}</button>
            </div>
        </div>
    )
}

