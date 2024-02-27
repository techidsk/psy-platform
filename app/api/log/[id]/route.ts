import { db } from '@/lib/db';
import { tr } from 'date-fns/locale';
import { NextResponse } from 'next/server';

/**
 * /api/log/[id]
 * 记录获取实验记录
 *
 * @returns
 */
export async function GET(request: Request, context: { params: any }) {
    try {
        // 记录日志
        // ...
        const response = await db.trail_logger.findMany({
            where: { experiment_id: context.params.id },
            select: {
                input: true,
                images: true,
                timestamp: true,
            },
        });
        if (response.length === 0) {
            return NextResponse.json({ msg: '没有记录' }, { status: 404 });
        }
        let csvContent = '\uFEFF';
        csvContent += 'Input,Images,Timestamp\n'; // 添加标题行
        response.forEach((row) => {
            let images = row.images as string[];

            csvContent += `${row.input},${images.join('|')},${row.timestamp}\n`; // 假设 images 是一个数组，使用 | 来分隔每个图片
        });

        // 返回CSV文件
        const filename = `${context.params.id}.csv`;
        return new Response(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
        return NextResponse.json({ msg: response });
    } catch (error) {
        console.error('更新失败:', error);
        return NextResponse.json({ msg: '服务器错误' }, { status: 500 });
    }
}
