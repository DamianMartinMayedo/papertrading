import type { PositionUpdate } from './types'

export function updatePositionOnBuy(
  current: PositionUpdate | null,
  quantity: number,
  executedPrice: number
): PositionUpdate {
  if (!current || !current.isOpen || current.quantity === 0) {
    return {
      quantity,
      averagePrice: executedPrice,
      totalCost: quantity * executedPrice,
      isOpen: true,
      realizedPnl: 0,
    }
  }

  const newQuantity = current.quantity + quantity
  const newTotalCost = current.totalCost + quantity * executedPrice
  const newAveragePrice = newTotalCost / newQuantity

  return {
    quantity: newQuantity,
    averagePrice: newAveragePrice,
    totalCost: newTotalCost,
    isOpen: true,
    realizedPnl: current.realizedPnl,
  }
}

export function updatePositionOnSell(
  current: PositionUpdate,
  quantity: number,
  executedPrice: number
): PositionUpdate {
  if (quantity > current.quantity) {
    throw new Error(`No se puede vender ${quantity}: solo hay ${current.quantity} en posición`)
  }

  const costBasis = current.averagePrice * quantity
  const realizedPnl = (executedPrice * quantity) - costBasis

  const newQuantity = current.quantity - quantity
  const isOpen = newQuantity > 0
  const newTotalCost = isOpen ? current.averagePrice * newQuantity : 0

  return {
    quantity: newQuantity,
    averagePrice: current.averagePrice,
    totalCost: newTotalCost,
    isOpen,
    realizedPnl: current.realizedPnl + realizedPnl,
  }
}

export function calculateUnrealizedPnl(
  position: PositionUpdate,
  currentPrice: number
): number {
  if (!position.isOpen || position.quantity === 0) return 0
  const marketValue = position.quantity * currentPrice
  return marketValue - position.totalCost
}
