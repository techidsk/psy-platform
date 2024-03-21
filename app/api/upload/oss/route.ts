import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
const OSS = require('ali-oss');
require('dotenv').config();

const END_POINT = process.env.END_POINT || '';
const ACCESS_KEY = process.env.ACCESS_KEY || '';
const SECRET_KEY = process.env.SECRET_KEY || '';
const BUCKET_NAME = process.env.BUCKET_NAME || '';

const client = new OSS({
    region: END_POINT,
    accessKeyId: ACCESS_KEY,
    accessKeySecret: SECRET_KEY,
    bucket: BUCKET_NAME,
});

/**
 * /api/upload/oss
 * Handles the POST request for uploading an image to Aliyun OSS.
 *
 * @param {Request} request - The HTTP request object.
 * @return {Promise<Response>} The HTTP response object.
 */
export async function POST(request: Request): Promise<Response> {
    const data = await request.json();

    // Get image data
    const imageData = data['imageData']; // Assuming image data is sent in the request

    if (!imageData) {
        const body = JSON.stringify({ msg: 'imageData is missing' });
        return new Response(body, { status: 400 });
    }

    // Generate a unique filename for the image
    const filename = `image-${Date.now()}.jpg`;

    try {
        // Upload the image to Aliyun OSS
        await client.put(filename, Buffer.from(imageData, 'base64'));

        // Get the uploaded image URL
        const imageUrl = client.signatureUrl(filename);
        return NextResponse.json({ msg: '已成功上传图片', url: imageUrl });
    } catch (error) {
        logger.error('Error uploading image:', error);
        return new Response(JSON.stringify({ msg: '上传失败' }), { status: 500 });
    }
}
