// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: 'psy',
            script: 'pnpm',
            args: 'run start',
            env: {
                // 设置环境变量
                NODE_ENV: 'production',
            },
            autorestart: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            cwd: '/root/code/psy-platform',
        },
    ],
};
