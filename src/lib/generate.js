require('dotenv').config()
// TODO comfyui生成地址
const url = `http://${process.env.COMFYUI_HOST}/generate/creative`;

console.log(url)

/**
 * Generates data by sending a prompt, intro, and select options to a web UI.
 * @param {string} systemPrompt - The prompt to send to the web UI.
 * @param {string} userPrompt - The introduction or hint for the prompt.
 * @returns {Promise<Object>} - The response data from the web UI.
 * @throws {Error} - If an error occurs during the fetch request.
 */
async function generate(prompt) {
    console.log('Send request to Comfyui');
    const data = {
        "taskType": "BASE",
        "negativePrompt": "nsfw",
        "prompt": prompt,
        "gptCreative": 1.0,
        "aspectRatio": "1:1"
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.status === 200) {
        const message = `An error has occurred: ${response.status}`;
        throw new Error(message);
    }
    return response.json();
}

export {
    generate,
}