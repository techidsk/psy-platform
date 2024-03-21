import { CenteredHero } from '@/components/experiment/modules/centerd-hero';

export default async function GuestClosed() {
    const content = `已完成本次项目所有实验或者当前未开放实验`;

    return (
        <div className="container mx-auto">
            <div className="flex flex-col gap-4">
                <div className="p-2">
                    <div className="hero">
                        <div className="hero-content text-center">
                            <div className="max-w-md">
                                <CenteredHero title={'暂无实验'} content={content} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
