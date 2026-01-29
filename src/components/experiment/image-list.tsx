'use client';
import LoadingSpin from '@/components/common/loading-spin';
import { ImageResponse } from '@/types/experiment';
import { useState, useEffect } from 'react';
import { Icons } from '../icons';
import { useExperimentState } from '@/state/_experiment_atoms';
import classNames from 'classnames';

interface ImageListProps extends React.HTMLAttributes<HTMLDivElement> {
    experimentImageList: ImageResponse[];
    displayNum?: number;
    isPicMode?: boolean;
}

const DEFAULT_IMAGE = 'https://zju-queen-psy.oss-cn-shanghai.aliyuncs.com/assets/bg-1.jpg';

export function ImageList({
    experimentImageList,
    displayNum = 1,
    isPicMode = false,
}: ImageListProps) {
    const [list, setList] = useState<ImageResponse[]>([]);
    const [index, setIndex] = useState(0);
    const [useFullSize, setUseFullSize] = useState(true);

    const setCurrentImages = useExperimentState((state) => state.setCurrentImages);

    function prev() {
        if (experimentImageList.length > displayNum) {
            setSliceList(index - 1);
        }
    }

    function next() {
        if (experimentImageList.length > displayNum) {
            if (index + 1 <= experimentImageList.length) {
                setSliceList(index + 1);
            }
        }
    }

    function setSliceList(newIndex: number) {
        let tmp = experimentImageList;
        let s = Math.max(newIndex - displayNum, 0);
        let e = Math.min(s + displayNum, experimentImageList.length);
        const imageList = tmp
            .slice(s, e)
            .map((item: ImageResponse, idx: number) => ({ ...item, idx: idx + s }));

        setList(imageList);
        setCurrentImages(imageList.map((item) => (isPicMode ? item.image_url : DEFAULT_IMAGE)));
        setIndex(Math.max(newIndex, 0));
    }

    useEffect(() => {
        let temp: ImageResponse[] = experimentImageList.map((item: ImageResponse, idx: number) => ({
            ...item,
            idx: idx,
        }));
        const imageList = temp.slice(-1 * displayNum);
        setList(imageList);
        setIndex(experimentImageList.length);
        setCurrentImages(imageList.map((item) => (isPicMode ? item.image_url : DEFAULT_IMAGE)));
    }, [experimentImageList, displayNum]);

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
        <div className="w-full h-full relative">
            {/* 图片和历史内容整体容器，带圆角边框 */}
            <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                {/* 图片区域 */}
                <div className="flex-1 relative min-h-0 bg-gray-50">
                    {list.length === 0 ? (
                        <img
                            className="object-contain w-full h-full absolute inset-0"
                            src={DEFAULT_IMAGE}
                            alt="默认图片"
                        />
                    ) : (
                        list.map((item) => (
                            <div key={item.id} className="w-full h-full relative">
                                {isPicMode && item.state === 'GENERATING' ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <LoadingSpin displayNum={displayNum} />
                                    </div>
                                ) : (
                                    <img
                                        className="object-contain w-full h-full absolute inset-0"
                                        src={isPicMode ? item.image_url : DEFAULT_IMAGE}
                                        alt=""
                                    />
                                )}
                            </div>
                        ))
                    )}
                </div>
                {/* 历史内容区域 */}
                <div className="p-3 bg-gray-50 border-t border-gray-200 text-base text-gray-700 overflow-hidden text-ellipsis">
                    {list.length === 0 ? (
                        <span className="text-gray-400 italic">暂无历史内容</span>
                    ) : (
                        <div className="text-center">
                            <span className="font-semibold text-gray-800">{list[0].idx + 1}:</span>{' '}
                            {list[0].prompt}
                        </div>
                    )}
                </div>
            </div>
            {/* 左箭头 - 绝对定位在容器外部左侧 */}
            <div
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={prev}
            >
                <Icons.chevronLeft className="h-8 w-8 text-gray-500" />
            </div>
            {/* 右箭头 - 绝对定位在容器外部右侧 */}
            <div
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={next}
            >
                <Icons.chevronRight className="h-8 w-8 text-gray-500" />
            </div>
        </div>
    );
}
