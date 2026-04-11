import { db } from '@/lib/db';
import { ProjectGroupDetailView } from '@/components/project/group/project-group-detail-view';
import { getCurrentUser } from '@/lib/session';
import { canEdit } from '@/lib/permissions';

/**
 * 判断数据库中项目分组
 * @param id
 */
async function getProjectGroup(id: string) {
    const projectGroup = await db.project_group.findFirst({
        where: {
            id: parseInt(id),
        },
    });

    if (!projectGroup) {
        console.warn(`Project group [${id}] not found.`);
        return undefined;
    }

    return projectGroup;
}

async function getExperimentsByIds(id: number) {
    const experiments = await db.$queryRaw<any[]>`
        SELECT e.*,
        en.engine_name, en.engine_image, en.gpt_prompt, en.gpt_settings, en.template,
        pge.experiment_index, pge.id as project_group_unique_id
        FROM experiment e
        LEFT JOIN engine en ON en.id = e.engine_id
        LEFT JOIN project_group_experiments pge ON pge.experiment_id = e.id
        WHERE pge.project_group_id = ${id}
        ORDER BY pge.experiment_index ASC
    `;

    if (!experiments) {
        console.warn(`No experiments for project group[${id}]`);
        return [];
    }
    return experiments;
}

// 获取项目分组详情
export default async function ProjectGroupDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch data and check permissions in parallel
    const [projectGroup, experiments, user] = await Promise.all([
        getProjectGroup(id),
        getExperimentsByIds(parseInt(id)),
        getCurrentUser(),
    ]);

    const canUserEdit = canEdit(user?.role);

    return (
        <ProjectGroupDetailView
            canEdit={canUserEdit}
            projectGroup={projectGroup}
            experiments={experiments}
            projectGroupId={parseInt(id)}
        />
    );
}
