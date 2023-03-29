/** @type {import('next').NextConfig} */
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
}

module.exports = nextConfig
