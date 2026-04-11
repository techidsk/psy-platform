export async function register() {
    // 修复 Windows 终端日志中文乱码：终端默认 GBK，Node.js 输出 UTF-8
    // instrumentation.ts 仅在 Node.js 服务端运行，不进入 Edge Runtime
    if (process.platform === 'win32') {
        process.stdout.setEncoding('utf8');
        process.stderr.setEncoding('utf8');
    }
}
