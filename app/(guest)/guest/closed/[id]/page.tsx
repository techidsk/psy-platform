import { CenteredHero } from '@/components/experiment/modules/centerd-hero';

interface GuestClosedProps {
    params: Promise<{
        id: string; // 项目失败异常码
    }>;
}

type ERR_CODES_TYPES = {
    [key: string]: {
        title: string;
        content: string;
    };
};

const ERR_CODES: ERR_CODES_TYPES = {
    '30001': {
        title: '暂无实验',
        content: '当前时间无可用分组',
    },
    '30002': {
        title: '录入失败',
        content: '未能成功找到实验身份，请重新请求实验链接',
    },
    '30003': {
        title: '已完成实验',
        content: '您已经完成了本次实验',
    },
};

export default async function GuestClosed({ params }: GuestClosedProps) {
    const { id } = await params;
    let content = `已完成本次项目所有实验或者当前未开放实验`;
    let title = '暂无实验';

    // 根据 id 获取 content 和 title
    if (id in ERR_CODES) {
        content = ERR_CODES[id].content;
        title = ERR_CODES[id].title;
    }

    return (
        <div className="container mx-auto">
            <div className="flex flex-col gap-4">
                <div className="p-2">
                    <div className="hero">
                        <div className="hero-content text-center">
                            <div className="max-w-md">
                                <CenteredHero title={title} content={content} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
