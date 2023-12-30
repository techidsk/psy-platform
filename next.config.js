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
    ],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  }
}

module.exports = nextConfig
