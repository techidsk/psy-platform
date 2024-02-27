/**
 * 根据传入文件，根据SHA-256计算该文件的哈希值，返回该文件的哈希值字符串
 * e.g input-file -> e3d6444b2c81165233ed8275a96d8670bb0a7997a9bfd4a7267037472dcdfbd8
 * @param file
 * @returns {string}
 */
export async function calculateHash(file: File): Promise<string> {
    const hashBuffer = await calculateFileHash(file);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

function calculateFileHash(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async () => {
            try {
                const arrayBuffer = reader.result as ArrayBuffer;
                // 使用 crypto.subtle.digest 计算 SHA-256 哈希
                const hash = await crypto.subtle.digest('SHA-256', arrayBuffer);
                resolve(hash);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read the file.'));
        };

        reader.readAsArrayBuffer(file);
    });
}

type CompressedStructure = {
    compressedBlob: Blob;
    fileOriginType: string;
};

/**
 * 使用gzip方法压缩Blob对象。
 * @param file
 * @returns {CompressedStructure} 返回一个结构体，里面存放着已经丢失了原先文件类型信息的Blob对象和压缩前的Blob对象所指示的对象类型
 */
export async function compressBlob(file: Blob): Promise<CompressedStructure> {
    const compressedStream = file.stream().pipeThrough(new CompressionStream('gzip'));

    const fileInfo = file.type;

    const result = await new Response(compressedStream).blob();

    console.log('the test compressed result:', result);

    return {
        compressedBlob: result,
        fileOriginType: fileInfo,
    };
}

// async function readableToArray(reader) {
//     const chunks = [];
//     while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;
//         chunks.push(value);
//     }
//     return Uint8Array.from(chunks.flat());
// }
