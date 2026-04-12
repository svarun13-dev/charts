import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Workers run as a separate process, not inside Next.js
  serverExternalPackages: ['ioredis', '@prisma/client', 'ethers'],
}

export default nextConfig
