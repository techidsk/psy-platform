'use client';

import { getUrl } from '@/lib/url';
import { useEffect, useState } from 'react';
interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
    userExperimentNanoId: string;
    userId: string;
    buttonNum?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

// 图片生成历史记录
export function ImageHistory({ userExperimentNanoId, userId, size = 'md' }: ComponentProps) {
    const [images, setImages] = useState<any[]>([]);
    // 获取实验中的所有图片
    async function getImages() {
        const result = await fetch(getUrl('/api/user/experiment/trail'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userExperimentNanoId: userExperimentNanoId,
                userId: userId,
            }),
        });

        if (result.ok) {
            const responseBody = await result.json();

            const dataImages = responseBody.data.images;
            const steps = responseBody.data.experimentSteps;

            // 这里需要对 images 进行分组
            // image.part 对应 steps.part
            // 最后分组得到 [{part: 1, images: [image1, image2, ...]}, {part: 2, images: [image1, image2, ...]}] 格式
            const imagesGroup = steps.map((step: any) => {
                return {
                    part: step.part,
                    title: step.step_name,
                    stepImages: dataImages.filter((image: any) => image.part == step.part),
                };
            });

            setImages(imagesGroup);
        }
    }

    useEffect(() => {
        getImages();
    }, []);

    return (
        <div className="flex flex-col gap-8 w-full">
            {images.map((image) => {
                return (
                    <div key={image.nano_id} className="w-full">
                        <div className="text-2xl font-bold mb-4">{image.title}</div>
                        <div className="grid grid-cols-2 gap-4 items-start">
                            {image.stepImages.map((stepImage: any, index: number) => {
                                return (
                                    <div
                                        key={stepImage.nano_id}
                                        className="bg-base-200 rounded-2xl overflow-hidden shadow-md"
                                    >
                                        {stepImage.image_url && (
                                            <div className="overflow-hidden">
                                                <img
                                                    src={stepImage.image_url}
                                                    alt="image"
                                                    className="w-full h-auto transition-transform duration-300 hover:scale-101"
                                                />
                                            </div>
                                        )}
                                        <div className="p-4 text-sm text-base-content/80">
                                            <span className="font-semibold text-base-content">
                                                {index + 1}.
                                            </span>{' '}
                                            {stepImage.prompt}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="divider"></div>
                    </div>
                );
            })}
        </div>
    );
}
