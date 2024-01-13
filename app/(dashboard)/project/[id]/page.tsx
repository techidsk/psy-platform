import { db } from '@/lib/db';
import { ProjectCreateHeader } from '@/components/project/project-create-header';
import { ProjectCreateForm } from '@/components/project/project-create-form';
import SubpageHeader from '@/components/subpage-header';
import { ProjectEditButton } from '@/components/project/project-edit-button';

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

export default async function UserForm({ params: { id }, searchParams }: any) {
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
                    id={id}
                    edit={Boolean(edit)}
                />
            </SubpageHeader>
            <div className="flex flex-col gap-4">
                <ProjectCreateHeader heading="项目详情" />
                <ProjectCreateForm
                    className="w-full px-2"
                    edit={Boolean(edit)}
                    project={project}
                    projectGroups={projectGroups}
                    projectGroupsIds={projectGroups?.map((item) => item.id)}
                />
            </div>
        </div>
    );
}
