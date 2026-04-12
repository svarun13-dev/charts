import Redis from 'ioredis'

let redis: Redis | null = null

export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL
    if (!url) throw new Error('REDIS_URL environment variable is not set')
    redis = new Redis(url, { lazyConnect: false, maxRetriesPerRequest: 3 })
  }
  return redis
}

export const QUOTE_TTL_SECONDS = 120
export const STALE_THRESHOLD_SECONDS = 90

export function quoteKey(platform: string, ticker: string): string {
  return `quote:${platform}:${ticker}`
}
