import 'dotenv/config'
import { db } from '../db'
import { portfolios } from '../db/schema'

async function seedPortfolio() {
  console.log('Creando cartera por defecto...')

  const existing = await db.query.portfolios.findFirst({
    where: (t, { eq }) => eq(t.name, 'Cartera Principal'),
  })

  if (existing) {
    console.log('  Cartera Principal ya existe')
    return
  }

  await db.insert(portfolios).values({
    name: 'Cartera Principal',
    initialCapital: '10000',
    cash: '10000',
    currency: 'USD',
    mode: 'manual',
    realismLevel: 2,
    commissionFixed: '1',
    commissionPercent: '0.001',
    slippagePercent: '0.001',
  })

  console.log('  Cartera Principal creada con 10,000 USD')
}

seedPortfolio().catch(console.error)
