const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config()

const OSS = require('ali-oss');
const client = new OSS({
    region: process.env.OSS_REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    accessKeySecret: process.env.ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET,
    endpoint: process.env.ENDPOINT
});

async function downloadImage(url) {
    console.log('开始下载: ', url)
    try {
        const response = await fetch(url);
        const buffer = await response.buffer();
        return buffer;
    } catch (error) {
        console.error(`Error downloading image: ${error}`);
    }
}

async function uploadImage(url, object) {
    try {
        const buffer = await downloadImage(url)
        console.log(typeof buffer)
        console.log('开始上传: ', url, object)
        await client.put(object, buffer);
    } catch (e) {
        console.log(`Error uploading image: ${e.message}`);
    }
}

export {
    // put,
    uploadImage
}