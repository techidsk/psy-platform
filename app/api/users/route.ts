import { NextRequest, NextResponse } from 'next/server';
import { db, QueryBuilder, convertBigIntToString } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { dateFormat } from '@/lib/date';

export async function GET(request: NextRequest) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return NextResponse.json({ msg: '出现异常,请重新登录进行操作' }, { status: 401 });
    }

    const role = currentUser.role;
    if (role === 'USER') {
        return NextResponse.json({ msg: '没有权限' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const pageSize = Math.max(1, parseInt(searchParams.get('pagesize') || '10') || 10);

    const username = searchParams.get('username') || '';
    const email = searchParams.get('email') || '';
    const tel = searchParams.get('tel') || '';
    const qualtrics = searchParams.get('qualtrics') || '';
    const wechat_id = searchParams.get('wechat_id') || '';
    const group_name = searchParams.get('group_name') || '';
    const user_role = searchParams.get('role') || '';

    const qb = new QueryBuilder();
    qb.where('u.deleted = 0');
    if (role === 'SUPERADMIN') {
        // SUPERADMIN 看到所有用户
    } else if (role === 'ADMIN') {
        // ADMIN 看到除 SUPERADMIN 外的所有用户
        qb.where("u.user_role != 'SUPERADMIN'");
    } else {
        // 其他角色只看自己管理的用户
        qb.where("u.user_role != 'SUPERADMIN'");
        qb.where('u.manager_id = ?', currentUser.id);
    }
    if (username) qb.where('u.username LIKE ?', '%' + username + '%');
    if (email) qb.where('u.email LIKE ?', '%' + email + '%');
    if (tel) qb.where('u.tel LIKE ?', '%' + tel + '%');
    if (qualtrics) qb.where('u.qualtrics LIKE ?', '%' + qualtrics + '%');
    if (wechat_id) qb.where('u.wechat_id LIKE ?', '%' + wechat_id + '%');
    if (group_name) qb.where('pg.group_name LIKE ?', '%' + group_name + '%');
    if (user_role) qb.where('u.user_role LIKE ?', '%' + user_role + '%');

    const { sql: whereSql, params } = qb.build();

    // 查询总数
    const countResult = await db.$queryRawUnsafe<[{ total: bigint }]>(
        `SELECT COUNT(DISTINCT u.id) as total
        FROM user u
        LEFT JOIN user_group g ON g.id = u.user_group_id
        LEFT JOIN project_group pg ON pg.id = g.project_group_id
        WHERE ${whereSql}`,
        ...params
    );
    const total = Number(countResult[0]?.total ?? 0);

    // 查询分页数据
    const users = await db.$queryRawUnsafe<any[]>(
        `SELECT u.id, u.username, u.email, u.tel, u.avatar, u.user_role, u.create_time, u.qualtrics, u.last_login_time, u.wechat_id,
        count(m.id) as manager_count, pg.group_name as user_group_name
        FROM user u
        LEFT JOIN user m ON u.id = m.manager_id
        LEFT JOIN user_group g ON g.id = u.user_group_id
        LEFT JOIN project_group pg ON pg.id = g.project_group_id
        WHERE ${whereSql}
        GROUP BY u.id, u.manager_id
        LIMIT ${Number(pageSize)} OFFSET ${Number((page - 1) * pageSize)}`,
        ...params
    );

    const data = users.map((user) =>
        convertBigIntToString({
            ...user,
            avatar: 'https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/avatar.avif',
            create_time: dateFormat(user.create_time),
            last_login_time: dateFormat(user.last_login_time),
        })
    );

    return NextResponse.json({ data, total, page, pageSize });
}
