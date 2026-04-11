import { Job } from 'bull';
import { db, QueryBuilder } from '@/lib/db';
import JSZip from 'jszip';

import { logger } from '@/lib/logger';
import { getUserExperimentHistory } from '@/lib/user_experment_history';
import * as R from 'ramda';
import path from 'path';
import { promises as fs } from 'fs';
import os from 'os';

const tempDir = path.join(os.tmpdir(), 'psy-platform');

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

        logger.info(`========= Job ${job.id}: Temporary directory: ${tempDir} `);

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

        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

        if (zipBuffer.length === 0) {
            throw new Error('Generated zip is empty');
        }

        const tempFilePath = path.join(tempDir, `${job.id}.zip`);

        await fs.mkdir(tempDir, { recursive: true });
        await fs.writeFile(tempFilePath, new Uint8Array(zipBuffer));
        logger.info(`Job ${job.id}: Zip written to ${tempFilePath} (${zipBuffer.length} bytes)`);

        return { tempFilePath, completed: true };
    } catch (error) {
        logger.error(`Job ${job.id}: Error processing download: ${error}`);
        throw error;
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

    const qb = new QueryBuilder();
    qb.where('e.project_group_id > 0');
    if (role === 'USER') {
        qb.where('e.user_id = ?', currentUser.id);
    }
    if (role === 'ASSITANT') {
        qb.where('e.manager_id = ?', currentUser.id);
    }
    if (start_time) {
        qb.where('e.start_time >= ?', start_time);
    }
    if (finish_time) {
        qb.where('e.finish_time <= ?', finish_time);
    }
    if (username) {
        qb.where('u.username like ?', '%' + username + '%');
    }
    if (qualtrics) {
        qb.where('u.qualtrics like ?', '%' + qualtrics + '%');
    }
    if (engine_name) {
        qb.where('n.engine_name like ?', '%' + engine_name + '%');
    }
    if (group_name) {
        qb.where('g.group_name like ?', '%' + group_name + '%');
    }
    if (experiment_name) {
        qb.where('eper.experiment_name like ?', '%' + experiment_name + '%');
    }
    const { sql: whereSql, params } = qb.build();

    return await db.$queryRawUnsafe<any[]>(
        `SELECT e.*, u.username, u.avatar, u.qualtrics, n.engine_name, n.engine_image,
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
        WHERE ${whereSql}
        ORDER BY e.id DESC`,
        ...params
    );
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
        logger.error(`Failed to fetch zip for nano_id=${nano_id}: ${error}`);
        return null;
    }
};

export default processDownload;
