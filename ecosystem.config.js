// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: 'psy',
            script: 'node_modules/.bin/next',
            args: 'start -p 4545',
            env: {
                NODE_ENV: 'production',
                // 限制 Node.js 最大内存为 2GB，给系统和其他进程留空间
                NODE_OPTIONS: '--max-old-space-size=2048',
            },
            autorestart: true,
            // 内存超过 2.5GB 自动重启
            max_memory_restart: '2500M',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            cwd: '/root/code/psy-platform',
            // 错误重启延迟，避免频繁重启
            restart_delay: 3000,
            // 最大重启次数限制
            max_restarts: 10,
            // 监听模式关闭（生产环境）
            watch: false,
            // 合并日志输出
            merge_logs: true,
            // 实例数量：单实例即可，4GB 内存不建议多实例
            instances: 1,
            exec_mode: 'fork',
        },
    ],
};
