require('dotenv').config();
const url = `http://${process.env.COMFYUI_HOST_URL}/result`;

/**
 * 转发到ComfyUI生成接口
 * @param {string} prompt - The prompt to send to the web UI.
 * @returns {Promise<any>} - The response data from the web UI.
 * @throws {Error} - If an error occurs during the fetch request.
 */
async function generate(data: any) {
    console.log('Send request to Comfyui');
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
