import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const assets = [
  { ticker: 'TSLA', name: 'Tesla Inc.', assetType: 'equity', isin: 'US88160R1014' },
  { ticker: 'AAPL', name: 'Apple Inc.', assetType: 'equity', isin: 'US0378331005' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', assetType: 'equity', isin: 'US67066G1040' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', assetType: 'equity', isin: 'US5949181045' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', assetType: 'equity', isin: 'US02079K3059' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', assetType: 'equity', isin: 'US0231351067' },
  { ticker: 'META', name: 'Meta Platforms Inc.', assetType: 'equity', isin: 'US30303M1027' },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF', assetType: 'etf', isin: 'US78462F1030' },
  { ticker: 'QQQ', name: 'Invesco QQQ Trust', assetType: 'etf', isin: 'US46090E1038' },
  { ticker: 'COIN', name: 'Coinbase Global Inc.', assetType: 'equity', isin: 'US19260Q1076' },
  { ticker: 'NFLX', name: 'Netflix Inc.', assetType: 'equity', isin: 'US64110L1061' },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway Inc. B', assetType: 'equity', isin: 'US0846707026' },
  { ticker: 'GLD', name: 'SPDR Gold Trust ETF', assetType: 'etf', isin: 'US78463V1070' },
]

// Platform asset config per ticker
// contractAddress is a placeholder — replace with real addresses as verified
const platformAssets: Record<string, {
  platform: string
  chain: string
  contractAddress: string
  minBuyUsd: number
  buyUrl: string
  kycRequired: boolean
}[]> = {
  TSLA: [
    {
      platform: 'xstocks',
      chain: 'solana',
      contractAddress: 'TsLAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 1,
      buyUrl: 'https://app.xstocks.com/trade/TSLA',
      kycRequired: false,
    },
    {
      platform: 'backed',
      chain: 'ethereum',
      contractAddress: '0xbTSLAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 10,
      buyUrl: 'https://backed.fi/products/bTSLA',
      kycRequired: true,
    },
    {
      platform: 'swarm',
      chain: 'polygon',
      contractAddress: '0xsTSLAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 1,
      buyUrl: 'https://swarm.com/trade/TSLA',
      kycRequired: false,
    },
  ],
  AAPL: [
    {
      platform: 'xstocks',
      chain: 'solana',
      contractAddress: 'AaPLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 1,
      buyUrl: 'https://app.xstocks.com/trade/AAPL',
      kycRequired: false,
    },
    {
      platform: 'securitize',
      chain: 'ethereum',
      contractAddress: '0xsecAAPLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 50,
      buyUrl: 'https://securitize.io/invest/AAPL',
      kycRequired: true,
    },
    {
      platform: 'backed',
      chain: 'ethereum',
      contractAddress: '0xbAAPLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 10,
      buyUrl: 'https://backed.fi/products/bAAPL',
      kycRequired: true,
    },
  ],
  NVDA: [
    {
      platform: 'xstocks',
      chain: 'solana',
      contractAddress: 'NVDAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 1,
      buyUrl: 'https://app.xstocks.com/trade/NVDA',
      kycRequired: false,
    },
    {
      platform: 'swarm',
      chain: 'polygon',
      contractAddress: '0xsNVDAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 1,
      buyUrl: 'https://swarm.com/trade/NVDA',
      kycRequired: false,
    },
  ],
  MSFT: [
    {
      platform: 'xstocks',
      chain: 'solana',
      contractAddress: 'MSFTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 1,
      buyUrl: 'https://app.xstocks.com/trade/MSFT',
      kycRequired: false,
    },
    {
      platform: 'ondo',
      chain: 'ethereum',
      contractAddress: '0xoMSFTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 50,
      buyUrl: 'https://ondo.finance/trade/MSFT',
      kycRequired: true,
    },
  ],
  GOOGL: [
    {
      platform: 'xstocks',
      chain: 'solana',
      contractAddress: 'GOOGLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 1,
      buyUrl: 'https://app.xstocks.com/trade/GOOGL',
      kycRequired: false,
    },
    {
      platform: 'ondo',
      chain: 'ethereum',
      contractAddress: '0xoGOOGLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 50,
      buyUrl: 'https://ondo.finance/trade/GOOGL',
      kycRequired: true,
    },
  ],
  AMZN: [
    {
      platform: 'xstocks',
      chain: 'solana',
      contractAddress: 'AMZNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 1,
      buyUrl: 'https://app.xstocks.com/trade/AMZN',
      kycRequired: false,
    },
    {
      platform: 'securitize',
      chain: 'ethereum',
      contractAddress: '0xsecAMZNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 50,
      buyUrl: 'https://securitize.io/invest/AMZN',
      kycRequired: true,
    },
  ],
  META: [
    {
      platform: 'xstocks',
      chain: 'solana',
      contractAddress: 'METAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 1,
      buyUrl: 'https://app.xstocks.com/trade/META',
      kycRequired: false,
    },
    {
      platform: 'backed',
      chain: 'ethereum',
      contractAddress: '0xbMETAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 10,
      buyUrl: 'https://backed.fi/products/bMETA',
      kycRequired: true,
    },
  ],
  SPY: [
    {
      platform: 'xstocks',
      chain: 'solana',
      contractAddress: 'SPYXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 1,
      buyUrl: 'https://app.xstocks.com/trade/SPY',
      kycRequired: false,
    },
    {
      platform: 'ondo',
      chain: 'ethereum',
      contractAddress: '0xoSPYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 50,
      buyUrl: 'https://ondo.finance/trade/SPY',
      kycRequired: true,
    },
  ],
  QQQ: [
    {
      platform: 'ondo',
      chain: 'ethereum',
      contractAddress: '0xoQQQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 50,
      buyUrl: 'https://ondo.finance/trade/QQQ',
      kycRequired: true,
    },
  ],
  COIN: [
    {
      platform: 'xstocks',
      chain: 'solana',
      contractAddress: 'COINxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 1,
      buyUrl: 'https://app.xstocks.com/trade/COIN',
      kycRequired: false,
    },
  ],
  NFLX: [
    {
      platform: 'xstocks',
      chain: 'solana',
      contractAddress: 'NFLXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 1,
      buyUrl: 'https://app.xstocks.com/trade/NFLX',
      kycRequired: false,
    },
    {
      platform: 'swarm',
      chain: 'polygon',
      contractAddress: '0xsNFLXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 1,
      buyUrl: 'https://swarm.com/trade/NFLX',
      kycRequired: false,
    },
  ],
  'BRK.B': [
    {
      platform: 'securitize',
      chain: 'ethereum',
      contractAddress: '0xsecBRKBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 50,
      buyUrl: 'https://securitize.io/invest/BRKB',
      kycRequired: true,
    },
  ],
  GLD: [
    {
      platform: 'backed',
      chain: 'ethereum',
      contractAddress: '0xbGLDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      minBuyUsd: 10,
      buyUrl: 'https://backed.fi/products/bGLD',
      kycRequired: true,
    },
  ],
}

async function main() {
  console.log('Seeding database...')

  for (const asset of assets) {
    const created = await prisma.asset.upsert({
      where: { ticker: asset.ticker },
      update: { name: asset.name, assetType: asset.assetType, isin: asset.isin },
      create: { ticker: asset.ticker, name: asset.name, assetType: asset.assetType, isin: asset.isin },
    })

    const platforms = platformAssets[asset.ticker] ?? []
    for (const pa of platforms) {
      await prisma.platformAsset.upsert({
        where: {
          id: `${created.id}-${pa.platform}`,
        },
        update: {
          contractAddress: pa.contractAddress,
          minBuyUsd: pa.minBuyUsd,
          buyUrl: pa.buyUrl,
          kycRequired: pa.kycRequired,
        },
        create: {
          id: `${created.id}-${pa.platform}`,
          assetId: created.id,
          platform: pa.platform,
          chain: pa.chain,
          contractAddress: pa.contractAddress,
          minBuyUsd: pa.minBuyUsd,
          buyUrl: pa.buyUrl,
          kycRequired: pa.kycRequired,
        },
      })
    }

    console.log(`  ✓ ${asset.ticker} (${platforms.length} platforms)`)
  }

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
