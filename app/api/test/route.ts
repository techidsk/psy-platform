// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';

/**
 * /api/test
 * 获取用户信息
 *
 * @returns
 */
export async function GET() {
    return NextResponse.json('success');
}
