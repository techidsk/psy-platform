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
        <div className="w-full h-full flex items-center justify-center">
            <div className="cursor-pointer" onClick={prev}>
                <Icons.chevronLeft className="h-8 w-8" />
            </div>
            <div className="flex-1 h-full flex justify-center items-center">
                <div className="w-full h-full flex flex-col">
                    <div className="flex-1 relative min-h-0">
                        {list.length === 0 ? (
                            <Image
                                className="object-contain"
                                src={DEFAULT_IMAGE}
                                alt="默认图片"
                                layout="fill"
                            />
                        ) : (
                            list.map((item) => (
                                <div key={item.id} className="w-full h-full relative">
                                    {isPicMode && item.state === 'GENERATING' ? (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <LoadingSpin displayNum={displayNum} />
                                        </div>
                                    ) : (
                                        <Image
                                            className="object-contain"
                                            src={isPicMode ? item.image_url : DEFAULT_IMAGE}
                                            alt=""
                                            layout="fill"
                                        />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-2 bg-gray-50 text-lg text-gray-600 overflow-hidden text-ellipsis">
                        {list.length === 0 ? (
                            '暂无历史内容'
                        ) : (
                            <>
                                <span className="font-semibold">{list[0].idx + 1}: </span>
                                {list[0].prompt}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="cursor-pointer" onClick={next}>
                <Icons.chevronRight className="h-8 w-8" />
            </div>
        </div>
    );
}
