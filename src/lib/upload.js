const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
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
    try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        return buffer;
    } catch (error) {
        console.error(`Error downloading image: ${error}`);
    }
}

async function uploadImage(url, object) {
    try {
        const buffer = await downloadImage(url)
        await client.put(object, buffer);
    } catch (e) {
        console.log(`Error uploading image: ${e.message}`);
    }
}

export {
    // put,
    uploadImage
}

// uploadImage('https://oaidalleapiprodscus.blob.core.windows.net/private/org-a8BzHSW1sg0jINwwAKFJMoLj/user-FrlBdFGPc8gQD7h904HEUfSa/img-xx6oD88dlVT5nnwyIWfaF7SV.png?st=2023-04-27T09%3A20%3A28Z&se=2023-04-27T11%3A20%3A28Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-04-27T09%3A58%3A07Z&ske=2023-04-28T09%3A58%3A07Z&sks=b&skv=2021-08-06&sig=8pd7B%2BedfTL6JavKbC2d26VQlnQZ83dRMmqL/9xj7zM%3D',
//  '/project/_psy_/test/1.png')