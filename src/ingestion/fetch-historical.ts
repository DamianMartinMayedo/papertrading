import 'dotenv/config'
import { db } from '../db'
import { instruments, priceBars } from '../db/schema'
import { eq } from 'drizzle-orm'
import { createCoinGeckoProvider } from '../providers'

const HISTORICAL_DAYS = 365

async function fetchHistorical() {
  const provider = createCoinGeckoProvider()

  const allInstruments = await db.query.instruments.findMany({
    where: (t, { eq }) => eq(t.isActive, true),
  })

  if (allInstruments.length === 0) {
    console.log('No hay instrumentos. Ejecuta seed-instruments primero.')
    return
  }

  const toDate = new Date()
  const fromDate = new Date(toDate.getTime() - HISTORICAL_DAYS * 24 * 60 * 60 * 1000)

  for (const inst of allInstruments) {
    console.log(`Descargando histórico de ${inst.symbol} (${HISTORICAL_DAYS} días)...`)

    try {
      const ohlcv = await provider.getHistoricalOHLCV(inst.symbol, fromDate, toDate)

      let inserted = 0
      let skipped = 0

      for (const bar of ohlcv) {
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
          skipped++
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
        inserted++
      }

      console.log(`  ${inst.symbol}: ${inserted} velas insertadas, ${skipped} omitidas`)
    } catch (err) {
      console.error(`  Error con ${inst.symbol}:`, err instanceof Error ? err.message : err)
    }

    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  console.log('Descarga histórica completada')
}

fetchHistorical().catch(console.error)
