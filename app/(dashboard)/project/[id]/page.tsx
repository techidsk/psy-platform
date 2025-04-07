import { db } from '@/lib/db';
import { ProjectCreateForm } from '@/components/project/project-create-form';
import SubpageHeader, { SubpageContentHeader } from '@/components/subpage-header';
import { ProjectEditButton } from '@/components/project/project-edit-button';
import { notFound } from 'next/navigation';

/**
 * 判断数据库中项目是否存在,如果存在则进入编辑流程.
 * @param id
 */
async function getProject(id: string) {
    const project = await db.projects.findFirst({
        where: {
            id: parseInt(id),
        },
    });

    if (!project) {
        console.warn(`Project [${id}] not found.`);
        return undefined;
    }

    return project;
}

async function getProjectGroupIds(id: string) {
    const projectGroups = await db.project_group.findMany({
        where: {
            project_id: parseInt(id),
        },
    });

    if (!projectGroups) {
        console.warn(`Project [${id}] have no groups!`);
        return undefined;
    }

    return projectGroups;
}

export default async function ProjectDetail({ params: { id }, searchParams }: any) {
    // Validate the id parameter
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0 || String(parsedId) !== id) {
        notFound(); // Show 404 if id is not a valid positive integer string
    }

    // Initiate both requests in parallel
    const projectData = getProject(id);
    const projectGroupData = getProjectGroupIds(id);
    const edit = searchParams.edit === 'true'; // 从url中获取edit参数,如果为true则进入编辑模式
    const [project, projectGroups] = await Promise.all([projectData, projectGroupData]);

    return (
        <div className="container lg:max-w-none bg-white">
            <SubpageHeader>
                <ProjectEditButton
                    className="btn btn-primary btn-sm"
                    nano_id={id}
                    edit={Boolean(edit)}
                />
            </SubpageHeader>
            <div className="flex flex-col gap-4">
                <SubpageContentHeader heading="项目详情" />
                <ProjectCreateForm
                    className="w-full p-2 h-[800px]"
                    edit={Boolean(edit)}
                    project={project}
                    projectGroups={projectGroups}
                    projectGroupsIds={projectGroups?.map((item) => item.id)}
                    add={false}
                />
            </div>
        </div>
    );
}
