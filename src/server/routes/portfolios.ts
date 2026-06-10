import { Hono } from 'hono'
import { db } from '../../db'
import { portfolios, positions, executions } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

export const portfoliosRoutes = new Hono()

const createPortfolioSchema = z.object({
  name: z.string().min(1),
  initialCapital: z.number().positive(),
})

portfoliosRoutes.get('/', async (c) => {
  const all = await db.select().from(portfolios).where(eq(portfolios.isArchived, false))
  return c.json(all)
})

portfoliosRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')

  const portfolio = await db.select().from(portfolios).where(eq(portfolios.id, id)).limit(1)
  if (portfolio.length === 0) return c.json({ error: 'Not found' }, 404)

  const openPositions = await db
    .select()
    .from(positions)
    .where(and(eq(positions.portfolioId, id), eq(positions.isOpen, true)))

  const allExecutions = await db
    .select()
    .from(executions)
    .where(eq(executions.portfolioId, id))

  return c.json({
    ...portfolio[0],
    positions: openPositions,
    executions: allExecutions,
  })
})

portfoliosRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = createPortfolioSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ error: parsed.error.message }, 400)
  }

  const result = await db
    .insert(portfolios)
    .values({
      name: parsed.data.name,
      initialCapital: String(parsed.data.initialCapital),
      cash: String(parsed.data.initialCapital),
    })
    .returning()

  return c.json(result[0], 201)
})
