import { Icons } from '@/components/icons';

import { db } from '@/lib/db';
import { ProjectCreateHeader } from '@/components/project/project-create-header';
import { ProjectCreateForm } from '@/components/project/project-create-form';

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
        console.log(`Project [${id}] not found.`);
        return null;
    }

    return project;
}

export default async function UserForm({ params: { id } }: any) {
    const project = await getProject(id);
    return (
        <div className="container h-screen lg:max-w-none bg-white">
            <div className="mb-4">
                <button className="btn btn-ghost">
                    <Icons.back />
                    返回
                </button>
            </div>
            <div className="flex flex-col gap-4">
                <ProjectCreateHeader heading={`${project?.id ? '编辑项目' : '创建新项目'}`} />
                <ProjectCreateForm className="w-full px-2" />
            </div>
        </div>
    );
}
