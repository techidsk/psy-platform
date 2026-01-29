export default async function Wait({
    searchParams: searchParamsPromise,
}: {
    searchParams: Promise<{ [key: string]: string }>;
}) {
    const searchParams = await searchParamsPromise;
    const timeStamp = Math.floor(parseInt(searchParams.t || '0') / 1000 / 60);
    const days = Math.floor(timeStamp / 60 / 24);
    const hours = Math.floor((timeStamp - days * 24 * 60) / 60);

    return (
        <div className="container mx-auto">
            <div className="flex flex-col gap-4">
                <div className="p-2">
                    <div className="hero">
                        <div className="hero-content text-center">
                            <div className="max-w-md">
                                <div className="text-2xl">
                                    还需要等待{' '}
                                    <span className="text-2xl">
                                        {days} 天 {hours} 小时
                                    </span>
                                    进行下一场实验
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
