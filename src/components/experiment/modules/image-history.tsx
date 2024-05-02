import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
    buttonNum?: number;
    userId: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

// 图片生成历史记录
export async function ImageHistory({ content, userId, size = 'md' }: ComponentProps) {
    const user = await db.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            nano_id: true,
        },
    });

    if (!user?.nano_id) {
        logger.error('User nanoId is not found');
        return null;
    }
    // TODO 显示用户所有的出图结果

    return (
        <div className="hero">
            <div className="hero-content text-center">
                <div className={`max-w-${size}`}></div>
            </div>
        </div>
    );
}
