const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()

const configuration = new Configuration({
    // basePath: process.env.OPENAI_BASE_URL || '',
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function generate(prompt) {
    console.log('发送prompt到dall.E');
    let text = await translate(prompt)
    const response = await openai.createImage({
        prompt: text,
        n: 1,
        size: "512x512",
        // size: "1024x1024",
    });
    return response.data
}

async function translate(prompt) {
    let text = `将一下语句翻译成英文: ${prompt}`
    try {
        const response = await openai.createCompletion({
            model: "gpt-3.5-turbo",
            prompt: text,
            temperature: 0.3,
            max_tokens: 1024,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        })
        console.log('prompt: ', response.data.choices[0].text)
        return response.data.choices[0].text
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data.error);
        } else {
            console.log(error.message);
        }
        return prompt
    }
}


export {
    generate,
    translate
}