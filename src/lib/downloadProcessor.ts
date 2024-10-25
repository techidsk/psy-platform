import { Job } from 'bull';
import { db } from '@/lib/db';
import JSZip from 'jszip';
import { Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';
import { getUserExperimentHistory } from '@/lib/user_experment_history';
import * as R from 'ramda';
import path from 'path';
import { promises as fs } from 'fs';
import os from 'os';

// 方案1：使用系统临时目录（推荐）
const tempDir = path.join(os.tmpdir(), 'psy-platform');

// 方案2：使用环境变量
// const tempDir = process.env.TEMP_DIR || '/tmp/psy-platform';

// 方案3：使用固定的绝对路径
// const tempDir = '/tmp/psy-platform';

async function processDownload(job: Job) {
    const { searchParams, includeExperimentRecord, includeInputRecord, currentUser } = job.data;

    try {
        const experiments = await getFilteredExperiments(
            searchParams,
            currentUser,
            currentUser.role
        );
        const zip = new JSZip();

        logger.info(`Job ${job.id}: 实验记录数量: ${experiments.length}`);

        const BATCH_SIZE = 30;
        const experimentBatches = R.splitEvery(BATCH_SIZE, experiments);

        let processedCount = 0;
        const totalExperiments = experiments.length;
        let addedFiles = 0;

        for (const batch of experimentBatches) {
            // 检查任务是否被取消
            if ((await job.isActive()) === false) {
                logger.info(`Job ${job.id} was cancelled`);
                return { cancelled: true };
            }

            await Promise.all(
                batch.map(async (experiment: any) => {
                    const { nano_id, qualtrics, experiment_name, part } = experiment;
                    const filename =
                        part !== 0
                            ? `[${experiment_name}]-${part}-${qualtrics}-${nano_id}.zip`
                            : `[${experiment_name}]-${qualtrics}-${nano_id}.zip`;

                    const blob = await fetchZipFile(
                        nano_id,
                        part,
                        includeExperimentRecord,
                        includeInputRecord
                    );
                    if (blob) {
                        zip.file(filename, blob, { binary: true });
                        addedFiles++;
                        // logger.info(`Job ${job.id}: Added file ${filename} to zip`);
                    } else {
                        logger.warn(`Job ${job.id}: Could not add file ${filename} to zip`);
                    }
                })
            );

            processedCount += batch.length;
            const progress = (processedCount / totalExperiments) * 100;
            await job.progress(progress);
            logger.info(
                `Job ${job.id}: Progress: ${progress.toFixed(2)}% (${processedCount}/${totalExperiments})`
            );
        }

        logger.info(`Job ${job.id}: Total files added to zip: ${addedFiles}`);
        logger.info(`Job ${job.id}: Generating final zip content`);
        const zipContent = await zip.generateAsync({ type: 'blob' });

        logger.info(`Job ${job.id}: Zip content size: ${zipContent.size} bytes`);

        if (zipContent.size === 0) {
            logger.error(`Job ${job.id}: Generated zip is empty`);
            throw new Error('Generated zip is empty');
        }

        const tempFilePath = path.join(tempDir, `${job.id}.zip`);
        logger.info(`Preparing to write zip file to: ${tempFilePath}`);

        // 确保临时目录存在
        try {
            await fs.mkdir(tempDir, { recursive: true });
            logger.info(`Temporary directory ensured: ${tempDir}`);
        } catch (mkdirError) {
            logger.error(`Failed to create temporary directory: ${mkdirError}`);
            throw mkdirError;
        }

        // 将 ZIP 内容保存到临时文件
        try {
            await fs.writeFile(tempFilePath, Buffer.from(await zipContent.arrayBuffer()));
            logger.info(`Successfully wrote zip file to: ${tempFilePath}`);
        } catch (writeError) {
            logger.error(`Failed to write zip file: ${writeError}`);
            throw writeError;
        }

        // 检查文件是否确实被创建
        try {
            const stats = await fs.stat(tempFilePath);
            logger.info(`File created successfully. Size: ${stats.size} bytes`);
        } catch (statError) {
            logger.error(`Failed to verify file creation: ${statError}`);
            throw statError;
        }

        // 设置任务状态为完成
        await job.update({ state: 'completed' });
        logger.info(`Job ${job.id} completed successfully`);

        return { tempFilePath, completed: true };
    } catch (error) {
        logger.error(`Job ${job.id}: Error processing download: ${error}`);

        // 设置任务状态为失败
        await job.update({
            state: 'failed',
            failedReason: error instanceof Error ? error.message : String(error),
        });

        return { error: String(error), completed: false };
    }
}

async function getFilteredExperiments(searchParams: any, currentUser: any, role: string) {
    const {
        username,
        qualtrics,
        engine_name,
        group_name,
        experiment_name,
        start_time,
        finish_time,
    } = searchParams;

    return await db.$queryRaw<any[]>`
        SELECT e.*, u.username, u.avatar, u.qualtrics, n.engine_name, n.engine_image, 
        eper.experiment_name, g.group_name, num, project_group_experiment_num, es.step_name
        FROM user_experiments e
        LEFT JOIN user u ON u.id = e.user_id
        LEFT JOIN experiment eper ON eper.id = e.experiment_id
        LEFT JOIN project_group g ON g.id = e.project_group_id
        LEFT JOIN engine n ON n.id = e.engine_id
        LEFT JOIN (
            SELECT count(id) as num, user_id, project_group_id 
            FROM user_experiments 
            GROUP BY user_id, project_group_id
            ) ue ON ue.user_id = u.id AND ue.project_group_id = g.id
        LEFT JOIN (
            SELECT count(id) as project_group_experiment_num, project_group_id
            FROM project_group_experiments
            GROUP BY project_group_id
        ) pge ON pge.project_group_id = e.project_group_id
        LEFT JOIN experiment_steps es ON es.experiment_id = e.experiment_id and es.order = e.part
        WHERE 1 = 1 
        ${role === 'USER' ? Prisma.sql`and e.user_id = ${currentUser.id}` : Prisma.empty}
        ${role === 'ASSITANT' ? Prisma.sql`and e.manager_id = ${currentUser.id}` : Prisma.empty}
        ${start_time ? Prisma.sql`and e.start_time >= ${start_time}` : Prisma.empty}
        ${finish_time ? Prisma.sql`and e.finish_time <= ${finish_time}` : Prisma.empty}
        ${username ? Prisma.sql`and u.username like ${`%${username}%`}` : Prisma.empty}
        ${qualtrics ? Prisma.sql`and u.qualtrics like ${`%${qualtrics}%`}` : Prisma.empty}
        ${engine_name ? Prisma.sql`and n.engine_name like ${`%${engine_name}%`}` : Prisma.empty}
        ${group_name ? Prisma.sql`and g.group_name like ${`%${group_name}%`}` : Prisma.empty}
        ${experiment_name ? Prisma.sql`and eper.experiment_name like ${`%${experiment_name}%`}` : Prisma.empty}
        ORDER BY e.id DESC
    `;
}

const fetchZipFile = async (
    nano_id: string,
    part: number,
    includeExperimentRecord: boolean = true,
    includeInputRecord: boolean = true
) => {
    try {
        const partString = part ? part.toString() : '0';
        const response = await getUserExperimentHistory(
            nano_id,
            partString,
            includeExperimentRecord,
            includeInputRecord
        );

        const arrayBuffer = await response.arrayBuffer();
        return arrayBuffer;
    } catch (error) {
        console.error(`Failed to fetch or process the blob: ${error}`);
        return null; // Return null to indicate failure
    }
};

export default processDownload;
