import { CoinGeckoProvider } from './coingecko'
import type { MarketDataProvider } from './types'

export type { MarketDataProvider, OHLCV, CurrentPrice } from './types'
export { CoinGeckoProvider } from './coingecko'

export function createCoinGeckoProvider(): MarketDataProvider {
  const apiKey = process.env.COINGECKO_API_KEY
  if (!apiKey) {
    throw new Error('COINGECKO_API_KEY no está definida en el entorno')
  }
  return new CoinGeckoProvider(apiKey)
}
