import { db, QueryBuilder } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { dateFormat } from '@/lib/date';

export type ProjectState = 'AVAILABLE' | 'DRAFT' | 'ACHIVED';

export interface ProjectRecord {
    id: number;
    project_name: string;
    project_description: string;
    engines: JSON;
    state: ProjectState;
    settings: JSON;
    start_time: Date;
    end_time: Date;
    invite_code?: string;
    private?: boolean;
}

export interface ProjectSearchParams {
    project_name?: string;
    state?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface FormattedProjectRecord extends Omit<ProjectRecord, 'start_time' | 'end_time'> {
    start_time: string;
    end_time: string;
}

/**
 * 获取项目列表
 */
export async function getProjects(
    searchParams: ProjectSearchParams,
    page: number = 1,
    pageSize: number = 10
): Promise<FormattedProjectRecord[]> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return [];
    }

    const role = currentUser.role;
    if (role === 'USER') {
        return [];
    }

    const {
        project_name = '',
        state = '',
        sort_by = 'start_time',
        sort_order = 'desc',
    } = searchParams;

    const currentDate = new Date().toISOString().split('T')[0];

    const qb = new QueryBuilder();
    qb.where('1 = 1');
    if (project_name) {
        qb.where('p.project_name LIKE ?', '%' + project_name + '%');
    }
    if (state === 'AVAILABLE') {
        qb.where("p.state = 'AVAILABLE' AND p.end_time >= ?", currentDate);
    } else if (state === 'EXPIRED') {
        qb.where("p.state = 'AVAILABLE' AND p.end_time < ?", currentDate);
    } else if (state) {
        qb.where('p.state = ?', state);
    }

    const { sql: whereSql, params } = qb.build();
    const orderBySql = buildOrderBySql(sort_by, sort_order);

    const projects = await db.$queryRawUnsafe<ProjectRecord[]>(
        `SELECT * from projects p
        WHERE ${whereSql}
        ${orderBySql}
        LIMIT ${Number(pageSize)} OFFSET ${Number((page - 1) * pageSize)}`,
        ...params
    );

    return formatProjects(projects);
}

/**
 * 构建排序 SQL 片段（字段来自白名单，安全拼接）
 */
function buildOrderBySql(sortBy: string, sortOrder: string): string {
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const allowedSortFields: Record<string, string> = {
        id: 'p.id',
        project_name: 'p.project_name',
        start_time: 'p.start_time',
        end_time: 'p.end_time',
        state: 'p.state',
    };

    const field = allowedSortFields[sortBy] || 'p.start_time';
    return `ORDER BY ${field} ${order}`;
}

/**
 * 格式化项目记录
 */
function formatProjects(projects: ProjectRecord[]): FormattedProjectRecord[] {
    return projects.map((project) => {
        return {
            ...project,
            start_time: dateFormat(project.start_time).substring(0, 11),
            end_time: dateFormat(project.end_time).substring(0, 11),
        };
    });
}
