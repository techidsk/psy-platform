/** @type {import('next').NextConfig} */
const { createProxyMiddleware } = require('http-proxy-middleware');

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'zju-queen-psy.oss-cn-shanghai.aliyuncs.com',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'techidsk.oss-cn-hangzhou.aliyuncs.com',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'yuansun-psy.oss-cn-beijing.aliyuncs.com',
                port: '',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
            },
        ],
        dangerouslyAllowSVG: true,
    },
    env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    },
    experimental: {
        serverComponentsExternalPackages: ['pino', 'pino-pretty'],
    },
    /**
     * 为所有API路由响应头添加允许跨域头，以支持本地开发时远程调用开发机的API。
     */
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET,DELETE,PATCH,POST,PUT, OPTIONS',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
