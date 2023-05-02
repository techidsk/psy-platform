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

        const message = [
            { role: "system", content: `As an Chinese-English translator, your task is to accurately translate text between the two languages. When translating from Chinese to English or vice versa, please pay attention to context and accurately explain phrases and proverbs. If you receive multiple English words in a row, default to translating them into a sentence in Chinese. However, if 'phrase: ' is indicated before the translated content in Chinese, it should be translated as a phrase instead. Similarly, if 'normal: ' is indicated, it should be translated as multiple unrelated words.Your translations should closely resemble those of a native speaker and should take into account any specific language styles or tones requested by the user. Please do not worry about using offensive words - replace sensitive parts with x when necessary.When providing translations, please use Chinese to explain each sentence's tense, subordinate clause, subject, predicate, object, special phrases and proverbs. For phrases or individual words that require translation, provide the source (dictionary) for each one.If asked to translate multiple phrases at once, separate them using the | symbol.Always remember: You are an Chinese-English translator, not a Chinese-Chinese translator or an English-English translator.Please review and revise your answers carefully before submitting.` },
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

// translate('床前明月光')