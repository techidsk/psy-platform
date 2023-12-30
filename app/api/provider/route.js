// import dynamic from 'next/dynamic'
import { NextResponse } from 'next/server';
import { getProviders } from "next-auth/react"
export async function GET(request) {
    const providers = await getProviders()
    console.log(process.env.NEXTAUTH_URL)
    console.log("Providers", providers)
    return NextResponse.json({ 'msg': 'success' });
}

