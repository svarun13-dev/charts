/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['ioredis', '@prisma/client', 'ethers'],
}

export default nextConfig
