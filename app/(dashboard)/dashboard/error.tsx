'use client'; // Error components must be Client components

import { CenteredHero } from '@/components/experiment/modules/centerd-hero';
import { useEffect, useState } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        // Log the error to an error reporting service
        setErrorMessage(error.message);
    }, [error]);

    return (
        <div className="container mx-auto">
            <div className="flex flex-col gap-4">
                <div className="p-2">
                    <div className="hero">
                        <div className="hero-content text-center">
                            <div className="max-w-md">
                                <CenteredHero title={'出现异常'} content={''}>
                                    {/* <button onClick={() => reset()}>{errorMessage}</button> */}
                                    <div>{errorMessage || `暂时没有可用实验项目`}</div>
                                </CenteredHero>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
