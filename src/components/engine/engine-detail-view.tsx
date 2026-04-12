'use client';

import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';
import SubpageHeader, { SubpageContentHeader } from '@/components/subpage-header';
import { EnginePatchForm } from '@/components/engine/engine-patch-form';

interface EngineDetailViewProps {
    canEdit: boolean;
    engineId: number;
}

export function EngineDetailView({ canEdit, engineId }: EngineDetailViewProps) {
    const router = useRouter();

    function handleSuccess() {
        router.refresh();
    }

    return (
        <div className="container lg:max-w-none bg-white">
            <SubpageHeader />
            <div className="flex flex-col gap-4">
                <SubpageContentHeader heading="编辑引擎" />
                <EnginePatchForm
                    className="w-full px-2"
                    onSuccess={handleSuccess}
                    edit={true}
                    engineId={engineId}
                />
            </div>
        </div>
    );
}
