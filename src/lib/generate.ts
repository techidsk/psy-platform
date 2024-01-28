require('dotenv').config();
const url = `http://${process.env.COMFYUI_HOST}/generate/creative`;

/**
 * 转发到ComfyUI生成接口
 * @param {string} prompt - The prompt to send to the web UI.
 * @returns {Promise<any>} - The response data from the web UI.
 * @throws {Error} - If an error occurs during the fetch request.
 */
async function generate(prompt: string, negative_prompt: string) {
    console.log('Send request to Comfyui');
    const data = {
        taskType: 'BASE',
        negativePrompt: 'nsfw',
        prompt: prompt,
        negative_prompt: negative_prompt,
        gptCreative: 1.0,
        aspectRatio: '1:1',
    };
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

export { generate };
