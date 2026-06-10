import { describe, it, expect } from 'vitest'
import {
  createPortfolioState,
  processMarketOrder,
  calculatePortfolioPnl,
  getPortfolioValue,
} from '../portfolio'

const config = {
  commissionFixed: 1,
  commissionPercent: 0.001,
  slippagePercent: 0.001,
}

describe('portfolio (integration)', () => {
  it('flujo completo: compra → subida → venta con ganancia', () => {
    let state = createPortfolioState(10000, config)

    // Compra 1 BTC a 100
    const buyResult = processMarketOrder(state, {
      portfolioId: 'p1',
      instrumentId: 'btc',
      side: 'buy',
      quantity: 1,
      marketPrice: 100,
    })
    state = buyResult.state

    expect(state.cash).toBeCloseTo(10000 - 100.1 - 1.1001, 4)
    expect(buyResult.result.updatedPosition?.quantity).toBe(1)
    expect(buyResult.result.updatedPosition?.averagePrice).toBe(100.1)

    // BTC sube a 120, calculamos P&L no realizado
    const prices = new Map([['btc', 120]])
    const pnlBeforeSell = calculatePortfolioPnl(state, prices)
    expect(pnlBeforeSell.unrealized).toBeGreaterThan(0)
    expect(pnlBeforeSell.realized).toBe(0)

    // Vende 1 BTC a 120
    const sellResult = processMarketOrder(state, {
      portfolioId: 'p1',
      instrumentId: 'btc',
      side: 'sell',
      quantity: 1,
      marketPrice: 120,
    })
    state = sellResult.state

    expect(sellResult.result.updatedPosition?.quantity).toBe(0)
    expect(sellResult.result.updatedPosition?.isOpen).toBe(false)
    expect(sellResult.result.realizedPnl).toBeGreaterThan(0)

    const finalPnl = calculatePortfolioPnl(state, prices)
    expect(finalPnl.realized).toBeGreaterThan(0)
    expect(finalPnl.unrealized).toBe(0)
  })

  it('flujo con pérdida: compra → bajada → venta', () => {
    let state = createPortfolioState(10000, config)

    state = processMarketOrder(state, {
      portfolioId: 'p1',
      instrumentId: 'btc',
      side: 'buy',
      quantity: 1,
      marketPrice: 100,
    }).state
    state = processMarketOrder(state, {
      portfolioId: 'p1',
      instrumentId: 'btc',
      side: 'buy',
      quantity: 1,
      marketPrice: 100,
    }).state

    // BTC baja a 80
    const prices = new Map([['btc', 80]])
    const pnl = calculatePortfolioPnl(state, prices)
    expect(pnl.unrealized).toBeLessThan(0)

    // Vende todo a 80
    const sellResult = processMarketOrder(state, {
      portfolioId: 'p1',
      instrumentId: 'btc',
      side: 'sell',
      quantity: 2,
      marketPrice: 80,
    })
    state = sellResult.state

    expect(sellResult.result.realizedPnl).toBeLessThan(0)
  })

  it('calculatePortfolioPnl combina realizado + no realizado', () => {
    let state = createPortfolioState(10000, config)

    // Compra y vende BTC con ganancia
    state = processMarketOrder(state, {
      portfolioId: 'p1',
      instrumentId: 'btc',
      side: 'buy',
      quantity: 1,
      marketPrice: 100,
    }).state
    state = processMarketOrder(state, {
      portfolioId: 'p1',
      instrumentId: 'btc',
      side: 'sell',
      quantity: 1,
      marketPrice: 120,
    }).state

    // Compra ETH que sube
    state = processMarketOrder(state, {
      portfolioId: 'p1',
      instrumentId: 'eth',
      side: 'buy',
      quantity: 1,
      marketPrice: 50,
    }).state

    const prices = new Map([['btc', 120], ['eth', 60]])
    const pnl = calculatePortfolioPnl(state, prices)

    expect(pnl.realized).toBeGreaterThan(0)
    expect(pnl.unrealized).toBeGreaterThan(0)
  })

  it('getPortfolioValue suma cash + valor de posiciones', () => {
    let state = createPortfolioState(10000, config)

    state = processMarketOrder(state, {
      portfolioId: 'p1',
      instrumentId: 'btc',
      side: 'buy',
      quantity: 1,
      marketPrice: 100,
    }).state

    const prices = new Map([['btc', 150]])
    const value = getPortfolioValue(state, prices)

    expect(value).toBeGreaterThan(state.cash)
  })
})
