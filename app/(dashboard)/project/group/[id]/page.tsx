import { db } from '@/lib/db';
import SubpageHeader, { SubpageContentHeader } from '@/components/subpage-header';
import { ProjectGroupCreateForm } from '@/components/project/group/project-group-create-form';
import { Prisma } from '@prisma/client';

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

async function getExperimentsByIds(ids: number[]) {
    if (!ids) return [];
    if (ids.length === 0) {
        return [];
    }

    const experiments = await db.$queryRaw<any[]>`
        SELECT e.*, s.setting, s.intro, 
        en.engine_name, en.engine_image, en.gpt_prompt, en.gpt_settings, en.template
        FROM experiment e
        LEFT JOIN experiment_setting s ON s.experiment_id = e.id
        LEFT JOIN engine en ON en.id = s.experiment_id
        WHERE 1 = 1
        ${Prisma.sql`AND e.id IN (${Prisma.raw(ids.join(','))})`}
    `;

    if (!experiments) {
        console.warn(`No experiments in ${ids}`);
        return [];
    }
    return experiments;
}

export default async function ProjectGroupDetail({ params: { id }, searchParams }: any) {
    // Initiate both requests in parallel
    const projectGroup = await getProjectGroup(id);
    const experimentsIds = projectGroup?.experiments as number[];

    const experiments = await getExperimentsByIds(experimentsIds);

    return (
        <div className="container lg:max-w-none bg-white">
            <SubpageHeader></SubpageHeader>
            <div className="flex flex-col gap-4">
                <SubpageContentHeader heading="项目分组详情" />
                <ProjectGroupCreateForm
                    className="w-full p-2"
                    projectGroup={projectGroup}
                    experiments={experiments}
                />
            </div>
        </div>
    );
}
