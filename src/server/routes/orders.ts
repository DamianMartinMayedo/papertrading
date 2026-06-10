import { Hono } from 'hono'
import { db } from '../../db'
import { orders, executions, positions, portfolios, priceBars } from '../../db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { z } from 'zod'
import { executeMarketOrder, updatePositionOnBuy, updatePositionOnSell } from '../../engine'

export const ordersRoutes = new Hono()

const createOrderSchema = z.object({
  portfolioId: z.string(),
  instrumentId: z.string(),
  side: z.enum(['buy', 'sell']),
  quantity: z.number().positive(),
})

ordersRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = createOrderSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ error: parsed.error.message }, 400)
  }

  const { portfolioId, instrumentId, side, quantity } = parsed.data

  const portfolio = await db.select().from(portfolios).where(eq(portfolios.id, portfolioId)).limit(1)
  if (portfolio.length === 0) return c.json({ error: 'Portfolio not found' }, 404)

  const latestBar = await db
    .select()
    .from(priceBars)
    .where(eq(priceBars.instrumentId, instrumentId))
    .orderBy(desc(priceBars.date))
    .limit(1)

  if (latestBar.length === 0) return c.json({ error: 'No price data available' }, 400)

  const marketPrice = Number(latestBar[0].close)

  const config = {
    commissionFixed: Number(portfolio[0].commissionFixed),
    commissionPercent: Number(portfolio[0].commissionPercent),
    slippagePercent: Number(portfolio[0].slippagePercent),
  }

  try {
    const execResult = executeMarketOrder(
      { portfolioId, instrumentId, side, quantity, marketPrice },
      config,
      Number(portfolio[0].cash)
    )

    const order = await db
      .insert(orders)
      .values({
        portfolioId,
        instrumentId,
        type: 'market',
        side,
        status: 'executed',
        quantity: String(quantity),
        executedAt: new Date(),
        executedPrice: String(execResult.execution.executedPrice),
        executedQuantity: String(quantity),
      })
      .returning()

    await db.insert(executions).values({
      orderId: order[0].id,
      portfolioId,
      instrumentId,
      side,
      quantity: String(quantity),
      price: String(marketPrice),
      executedPrice: String(execResult.execution.executedPrice),
      commission: String(execResult.execution.commission),
      slippage: String(execResult.execution.slippage),
      total: String(execResult.execution.total),
      executedAt: new Date(),
    })

    const existingPos = await db
      .select()
      .from(positions)
      .where(and(eq(positions.portfolioId, portfolioId), eq(positions.instrumentId, instrumentId)))

    let updatedPos
    if (side === 'buy') {
      updatedPos = updatePositionOnBuy(
        existingPos.length > 0 && existingPos[0].isOpen
          ? {
              quantity: Number(existingPos[0].quantity),
              averagePrice: Number(existingPos[0].averagePrice),
              totalCost: Number(existingPos[0].totalCost),
              isOpen: true,
              realizedPnl: Number(existingPos[0].realizedPnl ?? 0),
            }
          : null,
        quantity,
        execResult.execution.executedPrice
      )
    } else {
      if (existingPos.length === 0 || !existingPos[0].isOpen) {
        throw new Error('No open position to sell')
      }
      updatedPos = updatePositionOnSell(
        {
          quantity: Number(existingPos[0].quantity),
          averagePrice: Number(existingPos[0].averagePrice),
          totalCost: Number(existingPos[0].totalCost),
          isOpen: true,
          realizedPnl: Number(existingPos[0].realizedPnl ?? 0),
        },
        quantity,
        execResult.execution.executedPrice
      )
    }

    if (existingPos.length > 0) {
      await db
        .update(positions)
        .set({
          quantity: String(updatedPos.quantity),
          averagePrice: String(updatedPos.averagePrice),
          totalCost: String(updatedPos.totalCost),
          isOpen: updatedPos.isOpen,
          realizedPnl: String(updatedPos.realizedPnl),
          closedAt: updatedPos.isOpen ? null : new Date(),
          updatedAt: new Date(),
        })
        .where(eq(positions.id, existingPos[0].id))
    } else {
      await db.insert(positions).values({
        portfolioId,
        instrumentId,
        side: 'long',
        quantity: String(updatedPos.quantity),
        averagePrice: String(updatedPos.averagePrice),
        totalCost: String(updatedPos.totalCost),
        isOpen: updatedPos.isOpen,
        realizedPnl: String(updatedPos.realizedPnl),
        openedAt: new Date(),
      })
    }

    await db
      .update(portfolios)
      .set({ cash: String(execResult.updatedCash), updatedAt: new Date() })
      .where(eq(portfolios.id, portfolioId))

    return c.json({ order: order[0], execution: execResult.execution }, 201)
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : 'Execution failed' }, 400)
  }
})
