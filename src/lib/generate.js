// flask生成地址
let url = 'http://192.168.0.136:5454/generate';

async function generate(prompt, intro) {
    console.log('发送prompt到webui');
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

export {
    generate,
}