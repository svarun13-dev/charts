/**
 * Worker entry point.
 * Run with: npm run workers
 * Polls all price sources in parallel on their own intervals.
 */

import * as pollerXstocks    from './poller-xstocks'
import * as pollerOndo       from './poller-ondo'
import * as pollerBacked     from './poller-backed'
import * as pollerSwarm      from './poller-swarm'
import * as pollerSecuritize from './poller-securitize'

const INTERVALS: { name: string; poller: { poll: () => Promise<void> }; intervalMs: number }[] = [
  { name: 'xstocks',    poller: pollerXstocks,    intervalMs: 15_000 },
  { name: 'ondo',       poller: pollerOndo,       intervalMs: 30_000 },
  { name: 'backed',     poller: pollerBacked,     intervalMs: 30_000 },
  { name: 'swarm',      poller: pollerSwarm,      intervalMs: 30_000 },
  { name: 'securitize', poller: pollerSecuritize, intervalMs: 60_000 },
]

async function startPoller(name: string, poller: { poll: () => Promise<void> }, intervalMs: number) {
  console.log(`[workers] Starting ${name} (every ${intervalMs / 1000}s)`)

  // First poll immediately
  try {
    await poller.poll()
  } catch (err) {
    console.error(`[workers] ${name} initial poll failed:`, err)
  }

  setInterval(async () => {
    try {
      await poller.poll()
    } catch (err) {
      console.error(`[workers] ${name} poll failed:`, err)
    }
  }, intervalMs)
}

async function main() {
  console.log('[workers] Starting RWA price workers...')
  console.log(`[workers] NODE_ENV: ${process.env.NODE_ENV ?? 'development'}`)

  // Start all pollers concurrently
  await Promise.all(
    INTERVALS.map(({ name, poller, intervalMs }) =>
      startPoller(name, poller, intervalMs),
    ),
  )

  console.log('[workers] All workers started. Press Ctrl+C to stop.')
}

main().catch((err) => {
  console.error('[workers] Fatal error:', err)
  process.exit(1)
})
