export type OrderSide = 'buy' | 'sell'
export type OrderType = 'market'
export type OrderStatus = 'pending' | 'executed' | 'cancelled' | 'failed'

export interface MarketOrderRequest {
  portfolioId: string
  instrumentId: string
  side: OrderSide
  quantity: number
  marketPrice: number
}

export interface ExecutionData {
  orderId: string
  portfolioId: string
  instrumentId: string
  side: OrderSide
  quantity: number
  price: number
  executedPrice: number
  commission: number
  slippage: number
  total: number
  executedAt: Date
}

export interface ExecutionResult {
  execution: ExecutionData
  updatedPosition: PositionUpdate | null
  updatedCash: number
  realizedPnl: number
}

export interface PositionUpdate {
  quantity: number
  averagePrice: number
  totalCost: number
  isOpen: boolean
  realizedPnl: number
}

export interface PnLCalculation {
  unrealized: number
  realized: number
  total: number
}
