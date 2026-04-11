// 修复 Windows 终端日志中文乱码：终端默认 GBK，Node.js 输出 UTF-8
// 此文件仅通过动态 import 加载，不会被 Edge Runtime 静态分析扫描到
if (process.platform === 'win32') {
    process.stdout.setEncoding('utf8');
    process.stderr.setEncoding('utf8');
}
