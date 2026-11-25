'use client';
import LoadingSpin from '@/components/common/loading-spin';
import { ImageResponse } from '@/types/experiment';
import { useState, useEffect, useMemo } from 'react';
import { Icons } from '../icons';
import { useExperimentState } from '@/state/_experiment_atoms';
import styles from './image-list.module.css';

interface ImageListProps extends React.HTMLAttributes<HTMLDivElement> {
    experimentImageList: ImageResponse[];
    displayNum?: number;
    isPicMode?: boolean;
}

const DEFAULT_IMAGE = 'https://zju-queen-psy.oss-cn-shanghai.aliyuncs.com/assets/bg-1.jpg';

function ImageFrame({ url, waiting }: { url: string; waiting: boolean }) {
    const [layers, setLayers] = useState({ current: url, previous: '' });
    if (layers.current !== url) setLayers({ current: url, previous: layers.current });

    return (
        <div className={styles.frame} data-waiting={waiting}>
            {layers.previous && <img src={layers.previous} alt="" />}
            <img
                key={url}
                onAnimationEnd={() => setLayers({ current: url, previous: '' })}
                src={url}
                alt=""
                className={layers.previous ? styles.fade : undefined}
            />
        </div>
    );
}

export function ImageList({
    experimentImageList,
    displayNum = 1,
    isPicMode = false,
}: ImageListProps) {
    // A null cursor follows new submissions. A history cursor stays on the selected page.
    const [cursor, setCursor] = useState<number | null>(null);
    const latestId = experimentImageList[experimentImageList.length - 1]?.id;
    const [lastId, setLastId] = useState(latestId);
    if (lastId !== latestId) {
        setLastId(latestId);
        setCursor(null);
    }
    const start = Math.max(
        0,
        Math.min(cursor ?? Infinity, experimentImageList.length - displayNum)
    );
    const end = start + displayNum;
    const previewUrls = useExperimentState((state) => state.previewUrls);
    const setCurrentImages = useExperimentState((state) => state.setCurrentImages);
    const [decoded, setDecoded] = useState<Record<string, 'ready' | 'failed'>>({});
    const entries = useMemo(
        () =>
            experimentImageList.map((item, idx) => {
                const generating = item.state === 'GENERATING';
                const url = isPicMode
                    ? generating
                        ? previewUrls[item.nano_id || '']
                        : item.image_url
                    : DEFAULT_IMAGE;
                return {
                    item,
                    idx,
                    url: url || '',
                    failed: isPicMode && ['FAILED', 'TIMEOUT'].includes(item.state || ''),
                };
            }),
        [experimentImageList, isPicMode, previewUrls]
    );
    const targets = entries.slice(start, end);
    // Include preceding images so a reload during generation can also recover the last frame.
    const preceding = entries
        .slice(0, start)
        .filter((entry) => entry.url && !entry.failed)
        .slice(-displayNum);
    const [lastReady, setLastReady] = useState<Record<string, string>>({});
    const urlsKey = JSON.stringify(
        isPicMode
            ? [...preceding, ...targets]
                  .filter((entry) => entry.url && !entry.failed)
                  .map((entry) => [entry.item.id, entry.url])
            : []
    );
    useEffect(() => {
        let active = true;
        for (const [id, url] of JSON.parse(urlsKey) as [string, string][]) {
            if (decoded[url]) {
                if (decoded[url] === 'ready' && lastReady[id] !== url)
                    setLastReady((previous) => ({ ...previous, [id]: url }));
                continue;
            }
            const image = new Image();
            image.src = url;
            const record = (state: 'ready' | 'failed') => {
                if (!active) return;
                if (state === 'ready') setLastReady((previous) => ({ ...previous, [id]: url }));
                setDecoded((previous) => ({ ...previous, [url]: state }));
            };
            image.decode().then(
                () => record('ready'),
                () => record('failed')
            );
        }
        return () => {
            active = false;
        };
    }, [urlsKey, decoded, lastReady]);

    const ready = (entry: (typeof entries)[number]) =>
        !entry.failed && (!isPicMode || decoded[entry.url] === 'ready');
    const missing = targets.filter((entry) => !ready(entry) && !lastReady[entry.item.id]).length;
    const fallbacks = missing ? preceding.filter(ready).slice(-missing) : [];
    const slots = targets.map((target) => {
        const previousUrl = lastReady[target.item.id];
        const visible = ready(target)
            ? target
            : previousUrl
              ? { ...target, url: previousUrl }
              : fallbacks.shift();
        const failed =
            target.failed ||
            decoded[target.url] === 'failed' ||
            (isPicMode && !target.url && target.item.state !== 'GENERATING');
        return { visible, waiting: visible?.item.id !== target.item.id && !failed, failed };
    });
    const imagesKey = JSON.stringify(slots.map((slot) => slot.visible?.url || ''));
    useEffect(() => {
        setCurrentImages(JSON.parse(imagesKey));
    }, [imagesKey, setCurrentImages]);
    const caption = slots[0]?.visible;

    return (
        <div className="w-full h-full relative">
            <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                <div className="flex flex-1 relative min-h-0 bg-gray-50">
                    {!slots.length && (
                        <img
                            className="object-contain w-full h-full"
                            src={DEFAULT_IMAGE}
                            alt="默认图片"
                        />
                    )}
                    {slots.map(({ visible, waiting, failed }, index) => (
                        <div key={index} className="flex-1 relative min-w-0 overflow-hidden">
                            {visible ? (
                                <ImageFrame url={visible.url} waiting={waiting} />
                            ) : (
                                waiting && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <LoadingSpin displayNum={displayNum} />
                                    </div>
                                )
                            )}
                            {(failed || (waiting && visible)) && (
                                <small
                                    role="status"
                                    className="absolute bottom-2 right-2 rounded bg-white/90 px-2 py-1 text-gray-700"
                                >
                                    {failed ? '图片未能显示' : '正在生成下一张…'}
                                </small>
                            )}
                        </div>
                    ))}
                </div>
                <div className="p-3 bg-gray-50 border-t border-gray-200 text-base text-gray-700 text-center">
                    {caption ? (
                        <>
                            <strong>{caption.idx + 1}:</strong> {caption.item.prompt}
                        </>
                    ) : (
                        !slots.length && <span className="text-gray-400 italic">暂无历史内容</span>
                    )}
                </div>
            </div>
            <button
                aria-label="上一张"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full p-2 hover:bg-gray-100 rounded-full"
                onClick={() => setCursor(Math.max(0, start - 1))}
            >
                <Icons.chevronLeft className="h-8 w-8 text-gray-500" />
            </button>
            <button
                aria-label="下一张"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full p-2 hover:bg-gray-100 rounded-full"
                onClick={() => setCursor(end + 1 >= entries.length ? null : start + 1)}
            >
                <Icons.chevronRight className="h-8 w-8 text-gray-500" />
            </button>
        </div>
    );
}
