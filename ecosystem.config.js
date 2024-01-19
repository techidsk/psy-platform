// ecosystem.config.js
module.exports = { apps: [{ name: 'psy', script: 'pnpm', args: 'run start', env: {
      // 设置环境变量
      NODE_ENV: 'production'
    }
  }]
};
