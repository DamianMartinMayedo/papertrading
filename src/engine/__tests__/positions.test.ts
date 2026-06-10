import { describe, it, expect } from 'vitest'
import { updatePositionOnBuy, updatePositionOnSell, calculateUnrealizedPnl } from '../positions'

describe('positions', () => {
  describe('updatePositionOnBuy', () => {
    it('crea posición nueva desde cero', () => {
      const pos = updatePositionOnBuy(null, 1, 100)
      expect(pos.quantity).toBe(1)
      expect(pos.averagePrice).toBe(100)
      expect(pos.totalCost).toBe(100)
      expect(pos.isOpen).toBe(true)
    })

    it('recalcula precio medio al comprar más', () => {
      const initial = updatePositionOnBuy(null, 1, 100)
      const updated = updatePositionOnBuy(initial, 1, 120)
      expect(updated.quantity).toBe(2)
      expect(updated.averagePrice).toBe(110)
      expect(updated.totalCost).toBe(220)
    })
  })

  describe('updatePositionOnSell', () => {
    it('calcula P&L realizado al vender completamente', () => {
      const pos = updatePositionOnBuy(null, 1, 100)
      const closed = updatePositionOnSell(pos, 1, 120)
      expect(closed.realizedPnl).toBe(20)
      expect(closed.quantity).toBe(0)
      expect(closed.isOpen).toBe(false)
    })

    it('calcula P&L realizado al vender parcialmente', () => {
      const pos = updatePositionOnBuy(null, 2, 100)
      const partial = updatePositionOnSell(pos, 1, 120)
      expect(partial.realizedPnl).toBe(20)
      expect(partial.quantity).toBe(1)
      expect(partial.isOpen).toBe(true)
      expect(partial.averagePrice).toBe(100)
    })

    it('pierde P&L si se vende más barato', () => {
      const pos = updatePositionOnBuy(null, 1, 100)
      const closed = updatePositionOnSell(pos, 1, 80)
      expect(closed.realizedPnl).toBe(-20)
    })

    it('rechaza vender más de lo que hay', () => {
      const pos = updatePositionOnBuy(null, 1, 100)
      expect(() => updatePositionOnSell(pos, 2, 120)).toThrow('No se puede vender')
    })
  })

  describe('calculateUnrealizedPnl', () => {
    it('calcula ganancia no realizada', () => {
      const pos = updatePositionOnBuy(null, 1, 100)
      expect(calculateUnrealizedPnl(pos, 120)).toBe(20)
    })

    it('calcula pérdida no realizada', () => {
      const pos = updatePositionOnBuy(null, 1, 100)
      expect(calculateUnrealizedPnl(pos, 80)).toBe(-20)
    })

    it('cero si la posición está cerrada', () => {
      const pos = updatePositionOnBuy(null, 1, 100)
      const closed = updatePositionOnSell(pos, 1, 120)
      expect(calculateUnrealizedPnl(closed, 150)).toBe(0)
    })
  })
})
