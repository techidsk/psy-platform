import { NextResponse } from 'next/server'

export default async function handler(req, res) {
    console.log('api/generate/hello')
    return res.status(200).json({ 'msg': 'handler: 发布成功 in generate Hello' })
}