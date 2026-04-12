'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import { toast } from '@/hooks/use-toast';
import SubpageHeader, { SubpageContentHeader } from '@/components/subpage-header';
import { ExperimentCreateForm } from '@/components/experiment/experiment-create-form';
import { RegenerateIntentButton } from '@/components/experiment/regenerate-intent-button';
import type { experiment, experiment_steps, engine as experimentEngine } from '@/generated/prisma';

interface ExperimentDetailViewProps {
    canEdit: boolean;
    isSuperAdmin?: boolean;
    lock: boolean;
    experiment: experiment | null;
    nano_id: string;
    engines?: experimentEngine[] | null;
    steps?: experiment_steps[] | null;
}

export function ExperimentDetailView({
    canEdit,
    isSuperAdmin,
    lock,
    experiment,
    nano_id,
    engines,
    steps,
}: ExperimentDetailViewProps) {
    const [isEditing, setIsEditing] = useState(false);

    function handleEdit() {
        if (lock) {
            toast({
                title: '无法编辑',
                description: '当前实验已锁定，请解锁后再编辑',
                variant: 'destructive',
                duration: 3000,
            });
            return;
        }
        setIsEditing(true);
    }

    return (
        <div className="container lg:max-w-none bg-white">
            <SubpageHeader>
                {isSuperAdmin && nano_id && <RegenerateIntentButton nanoId={nano_id} />}
                {canEdit && !isEditing && (
                    <button onClick={handleEdit} className="btn btn-primary btn-sm">
                        <Icons.edit className="h-4 w-4" />
                        编辑
                    </button>
                )}
            </SubpageHeader>
            <div className="flex flex-col gap-4">
                <SubpageContentHeader heading={`${experiment?.id ? '编辑实验' : '创建新实验'}`} />
                <ExperimentCreateForm
                    className="w-full px-2"
                    edit={isEditing}
                    experiment={experiment}
                    nano_id={nano_id}
                    engines={engines}
                    steps={steps}
                />
            </div>
        </div>
    );
}
