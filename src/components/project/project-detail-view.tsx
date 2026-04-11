'use client';

import { useState } from 'react';
import { Icons } from '@/components/icons';
import SubpageHeader, { SubpageContentHeader } from '@/components/subpage-header';
import { ProjectCreateForm } from '@/components/project/project-create-form';
import type { projects, project_group } from '@/generated/prisma';

interface ProjectDetailViewProps {
    canEdit: boolean;
    project?: projects;
    projectGroups?: project_group[];
    projectGroupsIds?: number[];
}

export function ProjectDetailView({
    canEdit,
    project,
    projectGroups,
    projectGroupsIds,
}: ProjectDetailViewProps) {
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
                <SubpageContentHeader heading="项目详情" />
                <ProjectCreateForm
                    className="w-full p-2 h-[800px]"
                    edit={isEditing}
                    project={project}
                    projectGroups={projectGroups}
                    projectGroupsIds={projectGroupsIds}
                    add={false}
                />
            </div>
        </div>
    );
}
