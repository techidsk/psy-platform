// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';

/**
 * /api/experiment
 * @returns 
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    console.log(id);
    return NextResponse.json({
        "id": "2",
        "title": '社交媒体使用与孤独感：一项纵向研究',
        "image": 'https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/style1.webp'
    })
}