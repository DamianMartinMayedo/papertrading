export interface OHLCV {
  date: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface CurrentPrice {
  symbol: string
  price: number
  timestamp: Date
}

export interface MarketDataProvider {
  readonly name: string

  getCurrentPrice(symbol: string): Promise<CurrentPrice>

  getHistoricalOHLCV(
    symbol: string,
    fromDate: Date,
    toDate: Date
  ): Promise<OHLCV[]>

  getLatestOHLCV(symbol: string, days?: number): Promise<OHLCV[]>

  isHealthy(): Promise<boolean>
}
