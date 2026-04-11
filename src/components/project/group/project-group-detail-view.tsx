'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import SubpageHeader, { SubpageContentHeader } from '@/components/subpage-header';
import { ProjectGroupCreateForm } from '@/components/project/group/project-group-create-form';
import type { project_group } from '@/generated/prisma';

interface ProjectGroupDetailViewProps {
    canEdit: boolean;
    projectGroup?: project_group;
    experiments?: any[];
    projectGroupId: number;
}

export function ProjectGroupDetailView({
    canEdit,
    projectGroup,
    experiments,
    projectGroupId,
}: ProjectGroupDetailViewProps) {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="container lg:max-w-none bg-white">
            <SubpageHeader>
                {canEdit && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-sm">
                        <Icons.edit className="h-4 w-4" />
                        编辑
                    </button>
                )}
            </SubpageHeader>
            <div className="flex flex-col gap-4">
                <SubpageContentHeader heading="项目分组详情" />
                <ProjectGroupCreateForm
                    className="w-full p-2"
                    edit={isEditing}
                    projectGroup={projectGroup}
                    experiments={experiments}
                    projectGroupId={projectGroupId}
                />
            </div>
        </div>
    );
}
