const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

const OSS = require('ali-oss');
const client = new OSS({
    region: process.env.OSS_REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    accessKeySecret: process.env.ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET,
    endpoint: process.env.ENDPOINT,
});

async function downloadImage(url) {
    console.log('开始下载: ', url);
    try {
        const response = await fetch(url);
        const buffer = await response.buffer();
        return buffer;
    } catch (error) {
        console.error(`Error downloading image: ${error}`);
        return null;
    }
}

async function uploadImage(url, object) {
    try {
        const buffer = await downloadImage(url);
        console.log('开始上传: ', url, object);
        if (buffer) {
            await client.put(object, buffer);
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.log(`Error uploading image: ${e.message}`);
        return false;
    }
}

async function uploadFile(buffer, object) {
    try {
        console.log('开始上传文件: ', object);
        if (buffer) {
            const result = await client.put(object, buffer);
            console.log('上传成功: ', result.url);
            return result.url; // Return the OSS URL
        } else {
            console.error('Buffer is empty, upload failed.');
            return null;
        }
    } catch (e) {
        console.log(`Error uploading file: ${e.message}`);
        return null;
    }
}

export {
    // put,
    uploadImage,
    uploadFile, // Export the uploadFile function
};
