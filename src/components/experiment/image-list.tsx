'use client';
import LoadingSpin from '@/components/common/loading-spin';
import Image from 'next/image';
import { ImageResponse } from '@/types/experiment';
import { useState, useEffect } from 'react';
import { Icons } from '../icons';
import { useExperimentState } from '@/state/_experiment_atoms';

interface ImageListProps extends React.HTMLAttributes<HTMLDivElement> {
    experimentList: ImageResponse[];
    displayNum?: number;
}

export function ImageList({ experimentList, displayNum = 1 }: ImageListProps) {
    const [list, setList] = useState<ImageResponse[]>([]);
    const [index, setIndex] = useState(0);

    const setCurrentImages = useExperimentState((state) => state.setCurrentImages);

    useEffect(() => {
        let temp: ImageResponse[] = experimentList.map((item: ImageResponse, idx: number) => ({
            ...item,
            idx: idx,
        }));
        const imageList = temp.slice(-1 * displayNum);
        setList(imageList);
        setIndex(experimentList.length);
        setCurrentImages(imageList.map((item) => item.image_url));
    }, [experimentList, displayNum]);

    function prev() {
        if (experimentList.length > displayNum) {
            setSliceList(index - 1);
        }
    }

    function next() {
        if (experimentList.length > displayNum) {
            if (index + 1 <= experimentList.length) {
                setSliceList(index + 1);
            }
        }
    }

    function setSliceList(newIndex: number) {
        let tmp = experimentList;
        let s = Math.max(newIndex - displayNum, 0);
        let e = Math.min(s + displayNum, experimentList.length);
        const imageList = tmp
            .slice(s, e)
            .map((item: ImageResponse, idx: number) => ({ ...item, idx: idx + s }));

        setList(imageList);
        setCurrentImages(imageList.map((item) => item.image_url));
        setIndex(Math.max(newIndex, 0));
    }

    return (
        <>
            <div className="cursor-pointer" onClick={prev}>
                <Icons.chevronLeft className="mr-2 h-8 w-8" />
            </div>
            <div className="flex flex-wrap w-full justify-center items-center">
                {list.length === 0 && (
                    <div className="flex flex-col justify-center items-center rounded border-2 border-slate-300 h-[512px] w-[512px]">
                        <div className="image-holder w-full flex justify-center items-center">
                            <div className="w-full h-full flex flex-col gap-8 justify-center items-center">
                                <Icons.folder className="mr-2 h-8 w-8" />
                                <div className="text-gray-400">暂无历史内容</div>
                            </div>
                        </div>
                    </div>
                )}
                {list.map((item) => {
                    return (
                        <div
                            key={item.id}
                            className={displayNum === 2 ? `basis-1/2 xl:basis-1/4 p-2` : `p-2`}
                        >
                            <div className="flex flex-col justify-center items-center rounded border border-slate-300">
                                {item.state === 'GENERATING' ? (
                                    <div className="image-holder bg-gray-50 w-full flex justify-center items-center">
                                        <LoadingSpin displayNum={displayNum} />
                                    </div>
                                ) : (
                                    <Image
                                        className="image-holder"
                                        src={item.image_url}
                                        alt=""
                                        width={512}
                                        height={512}
                                    />
                                )}
                                {item.prompt && (
                                    <p className="border-t w-full border-slate-300 bg-gray-50 px-2 py-4 max-w-xl text-xs text-gray-600">
                                        <span className="text-gray-900">{item.idx + 1}: </span>{' '}
                                        {item.prompt}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="cursor-pointer" onClick={next}>
                <Icons.chevronRight className="mr-2 h-8 w-8" />
            </div>
        </>
    );
}
