/** @type {import('next').NextConfig} */
const { createProxyMiddleware } = require('http-proxy-middleware');

const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'techidsk.oss-cn-hangzhou.aliyuncs.com',
        port: '',
      },
    ],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  },
  async rewrites() {
    return [
      {
        source: '/openai/:path*',
        destination: '/openai-proxy/:path*',
      },
    ];
  },
  async serverMiddleware() {
    const apiProxy = createProxyMiddleware('/openai-proxy', {
      target: 'https://psy.kexunshe.com',
      changeOrigin: true,
      secure: false,
    });
    return [apiProxy];
  },
}

module.exports = nextConfig
