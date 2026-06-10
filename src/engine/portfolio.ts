import type { MarketOrderRequest, ExecutionResult, PositionUpdate, PnLCalculation } from './types'
import type { ExecutionConfig } from './execution'
import { executeMarketOrder } from './execution'
import { updatePositionOnBuy, updatePositionOnSell, calculateUnrealizedPnl } from './positions'

export interface PortfolioState {
  cash: number
  positions: Map<string, PositionUpdate>
  config: ExecutionConfig
}

export function createPortfolioState(
  initialCash: number,
  config: ExecutionConfig
): PortfolioState {
  return {
    cash: initialCash,
    positions: new Map(),
    config,
  }
}

export function processMarketOrder(
  state: PortfolioState,
  request: MarketOrderRequest
): { state: PortfolioState; result: ExecutionResult } {
  const executionResult = executeMarketOrder(request, state.config, state.cash)

  const currentPos = state.positions.get(request.instrumentId) ?? null
  let updatedPos: PositionUpdate

  if (request.side === 'buy') {
    updatedPos = updatePositionOnBuy(currentPos, request.quantity, executionResult.execution.executedPrice)
  } else {
    if (!currentPos || !currentPos.isOpen) {
      throw new Error('No hay posición abierta para vender')
    }
    updatedPos = updatePositionOnSell(currentPos, request.quantity, executionResult.execution.executedPrice)
    executionResult.realizedPnl = updatedPos.realizedPnl - (currentPos.realizedPnl ?? 0)
  }

  const newPositions = new Map(state.positions)
  newPositions.set(request.instrumentId, updatedPos)

  return {
    state: {
      ...state,
      cash: executionResult.updatedCash,
      positions: newPositions,
    },
    result: {
      ...executionResult,
      updatedPosition: updatedPos,
    },
  }
}

export function calculatePortfolioPnl(
  state: PortfolioState,
  marketPrices: Map<string, number>
): PnLCalculation {
  let unrealized = 0
  let realized = 0

  for (const [instrumentId, position] of state.positions) {
    const price = marketPrices.get(instrumentId)
    if (price !== undefined) {
      unrealized += calculateUnrealizedPnl(position, price)
    }
    realized += position.realizedPnl
  }

  return {
    unrealized,
    realized,
    total: unrealized + realized,
  }
}

export function getPortfolioValue(
  state: PortfolioState,
  marketPrices: Map<string, number>
): number {
  let positionsValue = 0
  for (const [instrumentId, position] of state.positions) {
    if (position.isOpen) {
      const price = marketPrices.get(instrumentId) ?? 0
      positionsValue += position.quantity * price
    }
  }
  return state.cash + positionsValue
}
