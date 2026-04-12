import { cn } from '@/lib/utils';

const sizeClasses = {
    xs: 'w-6 h-6 md:w-7 md:h-7',
    sm: 'w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9',
    md: 'w-10 h-10 md:w-12 md:h-12',
    lg: 'w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20',
} as const;

interface AvatarProps {
    src: string;
    alt?: string;
    size?: keyof typeof sizeClasses;
    ring?: boolean;
    className?: string;
}

export function Avatar({ src, alt = '', size = 'md', ring = false, className }: AvatarProps) {
    const img = (
        <img
            src={src}
            alt={alt}
            className={cn('rounded-full object-cover', sizeClasses[size], className)}
            loading="lazy"
        />
    );

    if (ring) {
        return <div className="ring-2 ring-slate-200 rounded-full p-0.5">{img}</div>;
    }

    return img;
}
