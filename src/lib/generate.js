const { Configuration, OpenAIApi } = require("openai");

require('dotenv').config()

const configuration = new Configuration({
    // basePath: process.env.OPENAI_BASE_URL || '',
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function generate(prompt, intro) {
    console.log('发送prompt到dall.E');
    let text = await translate(prompt)
    console.log(intro)
    text += intro
    const response = await openai.createImage({
        prompt: text,
        n: 1,
        size: "512x512",
        // size: "1024x1024",
    });
    console.log(response.data.data[0].url)
    return response.data
}


async function translate(prompt) {
    let text = `将一下语句翻译成英文: ${prompt}`
    try {

        const message = [
            { role: "system", content: `As an Chinese-English translator, your task is to accurately translate text between the two languages. When translating from Chinese to English or vice versa. Just reply the translated content to me.` },
            { role: "user", content: text },
        ];
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: message,
            temperature: 0.3,
            max_tokens: 1024,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        })
        console.log('prompt: ', response.data.choices[0].message.content)
        return response.data.choices[0].message.content
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

// generate('长着翅膀的女孩')