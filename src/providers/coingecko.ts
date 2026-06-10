import type { MarketDataProvider, OHLCV, CurrentPrice } from './types'

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
}

const BASE_URL = 'https://api.coingecko.com/api/v3'

export class CoinGeckoProvider implements MarketDataProvider {
  readonly name = 'coingecko'
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private getCoinId(symbol: string): string {
    const id = COINGECKO_IDS[symbol.toUpperCase()]
    if (!id) {
      throw new Error(`CoinGecko: símbolo no soportado: ${symbol}`)
    }
    return id
  }

  private buildUrl(path: string, params: Record<string, string> = {}): string {
    const url = new URL(`${BASE_URL}${path}`)
    url.searchParams.set('x_cg_demo_api_key', this.apiKey)
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
    return url.toString()
  }

  async getCurrentPrice(symbol: string): Promise<CurrentPrice> {
    const coinId = this.getCoinId(symbol)
    const url = this.buildUrl('/simple/price', {
      ids: coinId,
      vs_currencies: 'usd',
    })

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.status} ${res.statusText}`)
    }

    const data = await res.json() as Record<string, { usd: number }>
    const price = data[coinId]?.usd
    if (price === undefined) {
      throw new Error(`CoinGecko: precio no disponible para ${symbol}`)
    }

    return { symbol: symbol.toUpperCase(), price, timestamp: new Date() }
  }

  async getHistoricalOHLCV(
    symbol: string,
    fromDate: Date,
    toDate: Date
  ): Promise<OHLCV[]> {
    const coinId = this.getCoinId(symbol)
    const days = Math.ceil(
      (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    const url = this.buildUrl(`/coins/${coinId}/ohlc`, {
      vs_currency: 'usd',
      days: String(days),
    })

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.status} ${res.statusText}`)
    }

    const data = await res.json() as number[][]

    return data
      .map(([timestamp, open, high, low, close]) => ({
        date: new Date(timestamp),
        open,
        high,
        low,
        close,
        volume: 0,
      }))
      .filter((bar) => bar.date >= fromDate && bar.date <= toDate)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  async getLatestOHLCV(symbol: string, days: number = 1): Promise<OHLCV[]> {
    const toDate = new Date()
    const fromDate = new Date(toDate.getTime() - days * 24 * 60 * 60 * 1000)

    return this.getHistoricalOHLCV(symbol, fromDate, toDate)
  }

  async isHealthy(): Promise<boolean> {
    try {
      const url = this.buildUrl('/ping')
      const res = await fetch(url)
      return res.ok
    } catch {
      return false
    }
  }
}
