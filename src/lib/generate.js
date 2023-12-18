// TODO comfyui生成地址
const url = 'http://172.16.3.15:8080/generate/creative';

/**
 * Generates data by sending a prompt, intro, and select options to a web UI.
 * @param {string} systemPrompt - The prompt to send to the web UI.
 * @param {string} userPrompt - The introduction or hint for the prompt.
 * @returns {Promise<Object>} - The response data from the web UI.
 * @throws {Error} - If an error occurs during the fetch request.
 */
async function generate(userPrompt, systemPrompt, select) {
    console.log('发送prompt到webui');
    const data = {
        "taskType": "CREATIVE",
        "negPrompts": "nsfw",
        "prompt": systemPrompt,
        "gptCreative": 1.0,
        "aspectRatio": "1:1",
        "userPrompt": userPrompt
    }

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

export {
    generate,
}