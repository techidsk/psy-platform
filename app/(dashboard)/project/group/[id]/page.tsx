import { db } from '@/lib/db';
import SubpageHeader, { SubpageContentHeader } from '@/components/subpage-header';
import { ProjectGroupCreateForm } from '@/components/project/group/project-group-create-form';
import { EditProjectGroupButton } from '@/components/project/group/project-group-edit-button';

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
export default async function ProjectGroupDetail({
    params,
    searchParams: searchParamsPromise,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string }>;
}) {
    const { id } = await params;
    const searchParams = await searchParamsPromise;

    const projectGroup = await getProjectGroup(id);
    const experiments = await getExperimentsByIds(parseInt(id));
    const edit = searchParams.edit === 'true';

    return (
        <div className="container lg:max-w-none bg-white">
            <SubpageHeader>
                <EditProjectGroupButton className="btn btn-primary btn-sm" edit={Boolean(edit)} />
            </SubpageHeader>
            <div className="flex flex-col gap-4">
                <SubpageContentHeader heading="项目分组详情" />
                <ProjectGroupCreateForm
                    className="w-full p-2"
                    edit={Boolean(edit)}
                    projectGroup={projectGroup}
                    experiments={experiments}
                    projectGroupId={id}
                />
            </div>
        </div>
    );
}
