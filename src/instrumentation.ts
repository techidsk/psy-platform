export async function register() {
    // 静态分析会扫描所有文件，Node.js 专用代码必须通过动态 import 隔离
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        await import('./instrumentation.node');
    }
}
