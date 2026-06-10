import 'dotenv/config'
import { db } from '../db'
import { priceBars } from '../db/schema'
import { createCoinGeckoProvider } from '../providers'

async function fetchEOD() {
  const provider = createCoinGeckoProvider()

  const allInstruments = await db.query.instruments.findMany({
    where: (t, { eq }) => eq(t.isActive, true),
  })

  if (allInstruments.length === 0) {
    console.log('No hay instrumentos activos.')
    return
  }

  const today = new Date()
  const todayUTC = new Date(Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  ))

  console.log(`Ciclo EOD: ${todayUTC.toISOString().split('T')[0]}`)

  const latestBars = await provider.getLatestOHLCV('BTC', 1)
  if (latestBars.length === 0) {
    console.log('No hay datos disponibles aún para hoy')
    return
  }

  for (const inst of allInstruments) {
    try {
      const bars = await provider.getLatestOHLCV(inst.symbol, 1)
      if (bars.length === 0) continue

      const bar = bars[bars.length - 1]
      const dateUTC = new Date(Date.UTC(
        bar.date.getUTCFullYear(),
        bar.date.getUTCMonth(),
        bar.date.getUTCDate()
      ))

      const existing = await db.query.priceBars.findFirst({
        where: (t, { and, eq }) => and(
          eq(t.instrumentId, inst.id),
          eq(t.date, dateUTC)
        ),
      })

      if (existing) {
        console.log(`  ${inst.symbol}: ya existe, idempotente`)
        continue
      }

      await db.insert(priceBars).values({
        instrumentId: inst.id,
        date: dateUTC,
        open: String(bar.open),
        high: String(bar.high),
        low: String(bar.low),
        close: String(bar.close),
        volume: String(bar.volume),
        source: 'coingecko',
      })
      console.log(`  ${inst.symbol}: vela EOD insertada`)
    } catch (err) {
      console.error(`  Error con ${inst.symbol}:`, err instanceof Error ? err.message : err)
    }

    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  console.log('Ciclo EOD completado')
}

fetchEOD().catch(console.error)
