import type { Portfolio, Order, Execution, Position } from '../db/schema'

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

export interface ExecutionResult {
  execution: Omit<Execution, 'id' | 'createdAt'>
  updatedPosition: Omit<Position, 'id' | 'createdAt' | 'updatedAt'> | null
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
