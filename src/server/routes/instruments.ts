import { Hono } from 'hono'
import { db } from '../../db'
import { instruments, priceBars } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'

export const instrumentsRoutes = new Hono()

instrumentsRoutes.get('/', async (c) => {
  const all = await db.select().from(instruments).where(eq(instruments.isActive, true))
  return c.json(all)
})

instrumentsRoutes.get('/:id/price-bars', async (c) => {
  const id = c.req.param('id')
  const limit = Number(c.req.query('limit') ?? 100)

  const bars = await db
    .select()
    .from(priceBars)
    .where(eq(priceBars.instrumentId, id))
    .orderBy(desc(priceBars.date))
    .limit(limit)

  return c.json(bars.reverse())
})
