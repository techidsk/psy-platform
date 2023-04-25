import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({ 'msg': '发布成功 in generate Hello' });
}
