import { describe, it, expect } from 'vitest'
import { calculateSlippage, calculateCommission, executeMarketOrder } from '../execution'
import type { ExecutionConfig } from '../execution'

const config: ExecutionConfig = {
  commissionFixed: 1,
  commissionPercent: 0.001,
  slippagePercent: 0.001,
}

describe('execution', () => {
  describe('calculateSlippage', () => {
    it('aplica slippage en contra al comprar (precio sube)', () => {
      const result = calculateSlippage(100, 'buy', 0.001)
      expect(result).toBe(100.1)
    })

    it('aplica slippage en contra al vender (precio baja)', () => {
      const result = calculateSlippage(100, 'sell', 0.001)
      expect(result).toBe(99.9)
    })

    it('slippage cero no modifica el precio', () => {
      expect(calculateSlippage(100, 'buy', 0)).toBe(100)
      expect(calculateSlippage(100, 'sell', 0)).toBe(100)
    })
  })

  describe('calculateCommission', () => {
    it('suma comisión fija + porcentual', () => {
      const commission = calculateCommission(1, 100, config)
      expect(commission).toBe(1.1)
    })

    it('comisión solo fija si percent es 0', () => {
      const commission = calculateCommission(1, 100, { ...config, commissionPercent: 0 })
      expect(commission).toBe(1)
    })
  })

  describe('executeMarketOrder', () => {
    it('ejecuta compra con slippage y comisión', () => {
      const result = executeMarketOrder(
        { portfolioId: 'p1', instrumentId: 'btc', side: 'buy', quantity: 1, marketPrice: 100 },
        config,
        1000
      )

      expect(result.execution.executedPrice).toBe(100.1)
      expect(result.execution.commission).toBeCloseTo(1.1001, 4)
      expect(result.updatedCash).toBeCloseTo(1000 - 100.1 - 1.1001, 4)
    })

    it('ejecuta venta con slippage y comisión', () => {
      const result = executeMarketOrder(
        { portfolioId: 'p1', instrumentId: 'btc', side: 'sell', quantity: 1, marketPrice: 100 },
        config,
        1000
      )

      expect(result.execution.executedPrice).toBe(99.9)
      expect(result.updatedCash).toBeCloseTo(1000 + 99.9 - (1 + 99.9 * 0.001), 4)
    })

    it('rechaza compra si no hay cash suficiente', () => {
      expect(() =>
        executeMarketOrder(
          { portfolioId: 'p1', instrumentId: 'btc', side: 'buy', quantity: 1, marketPrice: 100 },
          config,
          50
        )
      ).toThrow('Cash insuficiente')
    })
  })
})
