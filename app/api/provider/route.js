// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { getProviders } from 'next-auth/react';
export async function GET(request) {
    const providers = await getProviders();
    return NextResponse.json({ msg: 'success' });
}
