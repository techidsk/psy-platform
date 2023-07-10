const { Configuration, OpenAIApi } = require("openai");

require('dotenv').config()

const configuration = new Configuration({
    // basePath: process.env.OPENAI_BASE_URL || '',
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

let url = 'http://192.168.0.135:5454/generate';

async function generate(prompt, intro) {
    console.log('发送prompt到webui');
    console.log('prompt: ' + prompt);
    console.log('intro: ' + intro);
    let data = { note: prompt, hint: intro };
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const message = `An error has occurred: ${response.status}`;
        throw new Error(message);
    }
    return response.json();
}


async function translate(prompt) {
    let text = `将一下语句翻译成英文: ${prompt}`
    try {

        const message = [
            // { role: "system", content: `As an Chinese-English translator, your task is to accurately translate text and just reply the translated content.` },
            { role: "system", content: `A tired and overwhelmed doctor stands in a hospital corridor surrounded by masked patients, questioning the meaning of their work and worrying about contracting the virus.` },
            { role: "user", content: prompt },
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
        let c = response.data.choices[0].message.content
        const keyword = "translated to";
        const index = c.indexOf(keyword); // 获取关键词的索引
        if (index !== -1) {
            c = c.substring(index + keyword.length); // 获取索引之后的字符
        }
        const regex = /.*?\"(.*?)\"/; // 匹配双引号内的内容
        const match = c.match(regex);
        if (match) {
            c = match[1]; // 获取双引号内的内容
        }
        console.log('prompt: ', c)
        return c
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

// translate('窗外的天空是蓝色的，我却感觉像是在监狱')