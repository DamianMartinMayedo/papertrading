import 'dotenv/config'
import { db } from '../db'
import { instruments } from '../db/schema'

const CRYPTO_INSTRUMENTS = [
  { symbol: 'BTC', name: 'Bitcoin', decimals: 8 },
  { symbol: 'ETH', name: 'Ethereum', decimals: 8 },
  { symbol: 'SOL', name: 'Solana', decimals: 8 },
]

async function seedInstruments() {
  console.log('Sembrando instrumentos crypto...')

  for (const inst of CRYPTO_INSTRUMENTS) {
    const existing = await db.query.instruments.findFirst({
      where: (t, { eq }) => eq(t.symbol, inst.symbol),
    })

    if (existing) {
      console.log(`  ${inst.symbol} ya existe, saltando`)
      continue
    }

    await db.insert(instruments).values({
      symbol: inst.symbol,
      name: inst.name,
      type: 'crypto',
      market: 'crypto',
      currency: 'USD',
      decimals: inst.decimals,
      isActive: true,
    })
    console.log(`  ${inst.symbol} creado`)
  }

  console.log('Instrumentos sembrados correctamente')
}

seedInstruments().catch(console.error)
