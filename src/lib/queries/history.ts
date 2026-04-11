import { db, QueryBuilder } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export interface ExperimentHistoryRecord {
    id: number;
    user_id: number;
    nano_id: string;
    experiment_id: number;
    type: string;
    engine_id: number;
    start_time: Date;
    finish_time: Date;
    username: string;
    avatar?: string;
    engine_name: string;
    engine_image: string;
    experiment_name?: string;
    group_name?: string;
    step_name?: string;
    part: number;
    qualtrics?: string;
    num?: number;
    project_group_experiment_num?: number;
}

export interface HistorySearchParams {
    username?: string;
    qualtrics?: string;
    engine_name?: string;
    group_name?: string;
    experiment_name?: string;
    start_time?: string;
    finish_time?: string;
    state?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface FormattedExperimentHistory extends Omit<
    ExperimentHistoryRecord,
    'start_time' | 'finish_time'
> {
    start_time: string;
    finish_time: string;
    start_timestamp: number;
    finish_timestamp: number;
}

/**
 * 获取实验历史记录
 */
export async function getExperimentHistory(
    searchParams: HistorySearchParams,
    page: number = 1,
    pageSize: number = 10
): Promise<FormattedExperimentHistory[]> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return [];
    }

    const role = currentUser.role;
    if (role === 'GUEST') {
        return [];
    }

    const {
        username,
        qualtrics,
        engine_name,
        group_name,
        experiment_name,
        start_time,
        finish_time,
        sort_by = 'id',
        sort_order = 'desc',
    } = searchParams;

    const qb = new QueryBuilder();
    qb.where("e.state = 'FINISHED'");
    qb.where('e.is_deleted = 0');
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
    const orderBySql = buildOrderBySql(sort_by, sort_order);

    const experiments = await db.$queryRawUnsafe<ExperimentHistoryRecord[]>(
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
        ${orderBySql}
        LIMIT ${Number(pageSize)} OFFSET ${Number((page - 1) * pageSize)}`,
        ...params
    );

    return formatExperimentHistory(experiments);
}

/**
 * 构建排序 SQL 片段（字段来自白名单，安全拼接）
 */
function buildOrderBySql(sortBy: string, sortOrder: string): string {
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const allowedSortFields: Record<string, string> = {
        id: 'e.id',
        start_time: 'e.start_time',
        finish_time: 'e.finish_time',
        username: 'u.username',
        experiment_name: 'eper.experiment_name',
        engine_name: 'n.engine_name',
        group_name: 'g.group_name',
    };

    const field = allowedSortFields[sortBy] || 'e.id';
    return `ORDER BY ${field} ${order}`;
}

/**
 * 格式化实验历史记录
 */
function formatExperimentHistory(
    experiments: ExperimentHistoryRecord[]
): FormattedExperimentHistory[] {
    return experiments.map((experiment) => {
        const startTime = experiment?.start_time;
        const finishTime = experiment?.finish_time;

        return {
            ...experiment,
            start_time: startTime ? formatDateTime(startTime) : '',
            finish_time: finishTime ? formatDateTime(finishTime) : '',
            start_timestamp: startTime ? new Date(startTime).getTime() : 0,
            finish_timestamp: finishTime ? new Date(finishTime).getTime() : 0,
        };
    });
}

/**
 * 格式化日期时间
 */
function formatDateTime(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
