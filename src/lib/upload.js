
require('dotenv').config()
const https = require('https');
const OSS = require('ali-oss');
const client = new OSS({
    region: process.env.OSS_REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    accessKeySecret: process.env.ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET,
    endpoint: process.env.ENDPOINT
});

function downloadImageAsBuffer(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode < 200 || response.statusCode >= 300) {
                return reject(new Error(`Failed to load image, status code: ${response.statusCode}`));
            }
            const chunks = [];
            response.on('data', (chunk) => {
                chunks.push(chunk);
            });

            response.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve(buffer);
            });

            response.on('error', (error) => {
                reject(error);
            });
        }).on('error', (error) => {
            console.error(`Error downloading image: ${error.message}`);
            reject(error);
        });
    });
}

async function uploadImage(url, object) {
    try {
        const buffer = await downloadImageAsBuffer(url)
        await client.put(object, buffer);
    } catch (e) {
        console.log(`Error uploading image: ${e.message}`);
    }
}

export {
    // put,
    uploadImage
}
