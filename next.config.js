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
