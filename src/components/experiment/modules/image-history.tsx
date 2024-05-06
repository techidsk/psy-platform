'use client';

import { getUrl } from '@/lib/url';
import Image from 'next/image';
import { useEffect, useState } from 'react';
interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
    userExperimentNanoId: string;
    userId: string;
    buttonNum?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

// 图片生成历史记录
export function ImageHistory({ userExperimentNanoId, userId, size = 'md' }: ComponentProps) {
    // TODO 显示用户所有的出图结果
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
            setImages(responseBody.data);
        }
    }

    useEffect(() => {
        getImages();
    }, []);

    return (
        <div className="grid grid-cols-2 gap-4">
            {images.map((image, index) => {
                return (
                    <div key={image.nano_id} className="flex-col-center">
                        {image.image_url && (
                            <Image src={image.image_url} alt="image" width={300} height={300} />
                        )}
                        <div>
                            {index + 1}, {image.prompt}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
