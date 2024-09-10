'use client';
import LoadingSpin from '@/components/common/loading-spin';
import Image from 'next/image';
import { ImageResponse } from '@/types/experiment';
import { useState, useEffect } from 'react';
import { Icons } from '../icons';
import { useExperimentState } from '@/state/_experiment_atoms';
import classNames from 'classnames';

interface ImageListProps extends React.HTMLAttributes<HTMLDivElement> {
    experimentList: ImageResponse[];
    displayNum?: number;
    isPicMode?: boolean;
}

const DEFAULT_IMAGE = 'https://zju-queen-psy.oss-cn-shanghai.aliyuncs.com/assets/bg-1.jpg';

export function ImageList({ experimentList, displayNum = 1, isPicMode = false }: ImageListProps) {
    const [list, setList] = useState<ImageResponse[]>([]);
    const [index, setIndex] = useState(0);
    const [useFullSize, setUseFullSize] = useState(true);

    const setCurrentImages = useExperimentState((state) => state.setCurrentImages);

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
        setCurrentImages(imageList.map((item) => (isPicMode ? item.image_url : DEFAULT_IMAGE)));
        setIndex(Math.max(newIndex, 0));
    }

    useEffect(() => {
        let temp: ImageResponse[] = experimentList.map((item: ImageResponse, idx: number) => ({
            ...item,
            idx: idx,
        }));
        const imageList = temp.slice(-1 * displayNum);
        setList(imageList);
        setIndex(experimentList.length);
        setCurrentImages(imageList.map((item) => (isPicMode ? item.image_url : DEFAULT_IMAGE)));
    }, [experimentList, displayNum]);

    useEffect(() => {
        function updateSize() {
            const vh = window.innerHeight;
            const vw = window.innerWidth;
            const calcSize = vh - 200 - 8 * 16; // Assuming 1rem = 16px

            const fullWidth = document.querySelector('.image-container')?.clientWidth || vw;

            // 如果 calcSize 大于 vw 或 vh，则使用 100% 的尺寸
            setUseFullSize(fullWidth <= calcSize || fullWidth <= calcSize);
        }

        window.addEventListener('resize', updateSize);
        updateSize();

        return () => window.removeEventListener('resize', updateSize);
    }, []);

    return (
        <>
            <div className="cursor-pointer" onClick={prev}>
                <Icons.chevronLeft className="mr-2 h-8 w-8" />
            </div>
            <div className="flex flex-wrap w-full justify-center items-center max-h-[100%] image-container">
                {list.length === 0 && (
                    <div className="flex-col-center rounded border-2 border-slate-300 w-full">
                        <div
                            className={classNames('flex-1', {
                                'w-full h-full': useFullSize,
                                'w-[calc(100vh-200px-8rem)] h-[calc(100vh-200px-8rem)]':
                                    !useFullSize,
                            })}
                        >
                            <div className="max-w-[1024px] max-h-[1024px] aspect-square flex-col-center gap-8">
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
                            className="flex-col-center rounded border border-slate-300 w-full"
                        >
                            {isPicMode && item.state === 'GENERATING' ? (
                                <div className="max-w-[1024px] max-h-[1024px] aspect-square flex-col-center gap-8">
                                    <LoadingSpin displayNum={displayNum} />
                                </div>
                            ) : (
                                <Image
                                    className="image-holder w-full"
                                    src={isPicMode ? item.image_url : DEFAULT_IMAGE}
                                    alt=""
                                    width={1024}
                                    height={1024}
                                />
                            )}
                            {item.prompt && (
                                <div className="w-full">
                                    <p className="border-t border-slate-300 bg-gray-50 px-2 py-4 text-lg text-gray-600">
                                        <span className="text-gray-900">{item.idx + 1}: </span>{' '}
                                        {item.prompt}
                                    </p>
                                </div>
                            )}
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
