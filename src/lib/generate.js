const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()

const configuration = new Configuration({
    basePath: process.env.OPENAI_BASE_URL || '',
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function generate(prompt) {
    console.log('发送prompt到dall.E');
    const response = await openai.createImage({
        prompt: prompt,
        n: 1,
        // size: "512x512",
        size: "1024x1024",
    });
    return response.data
}

export {
    generate
}