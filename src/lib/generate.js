// flask生成地址
let url = 'http://192.168.0.137:5000/generate';

async function generate(prompt, intro, select) {
    console.log('发送prompt到webui');
    let data = { note: prompt, hint: intro, select: select };
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