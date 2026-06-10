import type { MarketOrderRequest, ExecutionResult } from './types'

export interface ExecutionConfig {
  commissionFixed: number
  commissionPercent: number
  slippagePercent: number
}

export function calculateSlippage(price: number, side: 'buy' | 'sell', slippagePercent: number): number {
  const slippage = price * slippagePercent
  return side === 'buy' ? price + slippage : price - slippage
}

export function calculateCommission(quantity: number, price: number, config: ExecutionConfig): number {
  const notional = quantity * price
  const percentCommission = notional * config.commissionPercent
  return config.commissionFixed + percentCommission
}

export function executeMarketOrder(
  request: MarketOrderRequest,
  config: ExecutionConfig,
  currentCash: number
): ExecutionResult {
  const { side, quantity, marketPrice } = request

  const executedPrice = calculateSlippage(marketPrice, side, config.slippagePercent)
  const commission = calculateCommission(quantity, executedPrice, config)
  const total = quantity * executedPrice + (side === 'buy' ? commission : -commission)

  if (side === 'buy' && total > currentCash) {
    throw new Error(`Cash insuficiente: necesario ${total}, disponible ${currentCash}`)
  }

  const updatedCash = side === 'buy' ? currentCash - total : currentCash + total

  return {
    execution: {
      orderId: '',
      portfolioId: request.portfolioId,
      instrumentId: request.instrumentId,
      side,
      quantity,
      price: marketPrice,
      executedPrice,
      commission,
      slippage: Math.abs(executedPrice - marketPrice) * quantity,
      total,
      executedAt: new Date(),
    },
    updatedPosition: null,
    updatedCash,
    realizedPnl: 0,
  }
}
