import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
const OSS = require('ali-oss');
require('dotenv').config();

const REGION = process.env.REGION || '';
const ACCESS_KEY = process.env.ACCESS_KEY || '';
const SECRET_KEY = process.env.SECRET_KEY || '';
const BUCKET_NAME = process.env.BUCKET_NAME || '';

const client = new OSS({
    region: REGION,
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
export async function POST(request: Request) {
    // try {
    //     const formData = await request.formData();
    //     // Get image data
    //     const imageData = formData.get('imageData'); // Assuming image data is sent in the request
    //     if (!imageData) {
    //         logger.warn(`imageData is missing`);
    //         // 直接使用 Response 构造器返回错误信息
    //         return new Response(JSON.stringify({ msg: 'imageData is missing' }), {
    //             status: 400,
    //             headers: { 'Content-Type': 'application/json' },
    //         });
    //     }
    //     // Generate a unique filename for the image
    //     const filename = `image-${Date.now()}.jpg`;
    //     logger.info(typeof imageData);
    //     // Upload the image to Aliyun OSS
    //     await client.put(filename, imageData);
    //     // Get the uploaded image URL
    //     const imageUrl = client.signatureUrl(filename);
    //     logger.info(`上传成功: ${imageUrl}`);
    //     return NextResponse.json({ msg: '已成功上传图片', url: imageUrl });
    // } catch (error) {
    //     logger.error(`Error uploading image: ${error}`);
    //     return new Response(JSON.stringify({ msg: '上传失败' }), { status: 500 });
    // }
}
