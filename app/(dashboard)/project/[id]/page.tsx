import { db } from '@/lib/db';
import { ProjectDetailView } from '@/components/project/project-detail-view';
import { getCurrentUser } from '@/lib/session';
import { canEdit } from '@/lib/permissions';
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

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Validate the id parameter
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0 || String(parsedId) !== id) {
        notFound(); // Show 404 if id is not a valid positive integer string
    }

    // Fetch data and check permissions in parallel
    const [project, projectGroups, user] = await Promise.all([
        getProject(id),
        getProjectGroupIds(id),
        getCurrentUser(),
    ]);

    const canUserEdit = canEdit(user?.role);

    return (
        <ProjectDetailView
            canEdit={canUserEdit}
            project={project}
            projectGroups={projectGroups}
            projectGroupsIds={projectGroups?.map((item) => item.id)}
        />
    );
}
