// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';

/**
 * /api/experiment/detail
 * @returns 
 */
export async function POST(request) {

    const data = await request.json()
    return NextResponse.json({
        "id": "2",
        "title": '社交媒体使用与孤独感：一项纵向研究',
        "image": 'https://techidsk.oss-cn-hangzhou.aliyuncs.com/project/_psy_/style1.webp'
    })
}