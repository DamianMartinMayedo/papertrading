import { pgTable, text, timestamp, decimal, integer, boolean, index, uniqueIndex } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// ===== INSTRUMENTS =====
// Activos soportados (Fase 0: solo crypto)
export const instruments = pgTable('instruments', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  symbol: text('symbol').notNull().unique(), // BTC, ETH, SOL
  name: text('name').notNull(), // Bitcoin, Ethereum, Solana
  type: text('type').notNull().default('crypto'), // crypto, etf, stock
  market: text('market').notNull().default('crypto'), // crypto, nyse, nasdaq
  currency: text('currency').notNull().default('USD'), // divisa de cotización
  decimals: integer('decimals').notNull().default(8), // decimales para crypto
  isActive: boolean('is_active').notNull().default(true),
  metadata: text('metadata').default('{}'), // JSONB con metadatos adicionales
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  symbolIdx: uniqueIndex('instruments_symbol_idx').on(table.symbol),
}))

// ===== PRICE_BARS =====
// OHLCV diario por instrumento (INMUTABLE)
export const priceBars = pgTable('price_bars', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  instrumentId: text('instrument_id').notNull().references(() => instruments.id),
  date: timestamp('date', { withTimezone: true }).notNull(), // fecha de la vela (00:00 UTC para crypto)
  open: decimal('open', { precision: 24, scale: 8 }).notNull(),
  high: decimal('high', { precision: 24, scale: 8 }).notNull(),
  low: decimal('low', { precision: 24, scale: 8 }).notNull(),
  close: decimal('close', { precision: 24, scale: 8 }).notNull(),
  volume: decimal('volume', { precision: 24, scale: 8 }).notNull(),
  source: text('source').notNull().default('coingecko'), // proveedor de datos
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  instrumentDateIdx: uniqueIndex('price_bars_instrument_date_idx').on(table.instrumentId, table.date),
  dateIdx: index('price_bars_date_idx').on(table.date),
}))

// ===== PORTFOLIOS =====
// Carteras de trading
export const portfolios = pgTable('portfolios', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description'),
  initialCapital: decimal('initial_capital', { precision: 20, scale: 2 }).notNull(),
  cash: decimal('cash', { precision: 20, scale: 2 }).notNull(), // cash disponible
  currency: text('currency').notNull().default('EUR'), // divisa de contabilidad
  mode: text('mode').notNull().default('manual'), // manual, assisted, auto
  realismLevel: integer('realism_level').notNull().default(2), // 1: aprendiz, 2: realista, 3: crudo
  commissionFixed: decimal('commission_fixed', { precision: 10, scale: 2 }).notNull().default('0'), // € fijos por operación
  commissionPercent: decimal('commission_percent', { precision: 6, scale: 4 }).notNull().default('0.001'), // 0.1%
  slippagePercent: decimal('slippage_percent', { precision: 6, scale: 4 }).notNull().default('0.001'), // 0.1%
  isArchived: boolean('is_archived').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ===== ORDERS =====
// Órdenes de trading
export const orders = pgTable('orders', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  portfolioId: text('portfolio_id').notNull().references(() => portfolios.id),
  instrumentId: text('instrument_id').notNull().references(() => instruments.id),
  type: text('type').notNull(), // market, limit, stop_loss, take_profit, trailing_stop
  side: text('side').notNull(), // buy, sell
  status: text('status').notNull().default('pending'), // pending, executed, cancelled, expired
  quantity: decimal('quantity', { precision: 24, scale: 8 }).notNull(),
  limitPrice: decimal('limit_price', { precision: 24, scale: 8 }), // para órdenes limit
  stopPrice: decimal('stop_price', { precision: 24, scale: 8 }), // para stop loss
  executedAt: timestamp('executed_at', { withTimezone: true }),
  executedPrice: decimal('executed_price', { precision: 24, scale: 8 }),
  executedQuantity: decimal('executed_quantity', { precision: 24, scale: 8 }),
  strategyVersion: text('strategy_version'), // versión de estrategia que generó la orden
  notes: text('notes'), // tesis, emoción (para journaling)
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  portfolioIdx: index('orders_portfolio_idx').on(table.portfolioId),
  instrumentIdx: index('orders_instrument_idx').on(table.instrumentId),
  statusIdx: index('orders_status_idx').on(table.status),
}))

// ===== EXECUTIONS =====
// Ejecuciones de órdenes (INMUTABLE)
export const executions = pgTable('executions', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  orderId: text('order_id').notNull().references(() => orders.id),
  portfolioId: text('portfolio_id').notNull().references(() => portfolios.id),
  instrumentId: text('instrument_id').notNull().references(() => instruments.id),
  side: text('side').notNull(), // buy, sell
  quantity: decimal('quantity', { precision: 24, scale: 8 }).notNull(),
  price: decimal('price', { precision: 24, scale: 8 }).notNull(), // precio teórico del mercado
  executedPrice: decimal('executed_price', { precision: 24, scale: 8 }).notNull(), // precio real con slippage
  commission: decimal('commission', { precision: 20, scale: 8 }).notNull(),
  slippage: decimal('slippage', { precision: 20, scale: 8 }).notNull(),
  total: decimal('total', { precision: 24, scale: 8 }).notNull(), // quantity * executedPrice + commission
  executedAt: timestamp('executed_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  orderIdIdx: index('executions_order_idx').on(table.orderId),
  portfolioIdx: index('executions_portfolio_idx').on(table.portfolioId),
  instrumentIdx: index('executions_instrument_idx').on(table.instrumentId),
}))

// ===== POSITIONS =====
// Posiciones abiertas (materializada, derivable de executions)
export const positions = pgTable('positions', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  portfolioId: text('portfolio_id').notNull().references(() => portfolios.id),
  instrumentId: text('instrument_id').notNull().references(() => instruments.id),
  side: text('side').notNull().default('long'), // long (Fase 0 solo long)
  quantity: decimal('quantity', { precision: 24, scale: 8 }).notNull(),
  averagePrice: decimal('average_price', { precision: 24, scale: 8 }).notNull(), // precio medio de entrada
  totalCost: decimal('total_cost', { precision: 24, scale: 8 }).notNull(), // quantity * averagePrice
  isOpen: boolean('is_open').notNull().default(true),
  openedAt: timestamp('opened_at', { withTimezone: true }).notNull(),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  realizedPnl: decimal('realized_pnl', { precision: 20, scale: 8 }), // P&L realizado al cerrar
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  portfolioIdx: index('positions_portfolio_idx').on(table.portfolioId),
  instrumentIdx: index('positions_instrument_idx').on(table.instrumentId),
  openIdx: index('positions_open_idx').on(table.isOpen),
}))

// ===== PORTFOLIO_SNAPSHOTS =====
// Foto diaria de cada cartera (INMUTABLE)
export const portfolioSnapshots = pgTable('portfolio_snapshots', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  portfolioId: text('portfolio_id').notNull().references(() => portfolios.id),
  date: timestamp('date', { withTimezone: true }).notNull(),
  cash: decimal('cash', { precision: 20, scale: 2 }).notNull(),
  positionsValue: decimal('positions_value', { precision: 20, scale: 2 }).notNull(), // valor de mercado de posiciones abiertas
  totalValue: decimal('total_value', { precision: 20, scale: 2 }).notNull(), // cash + positionsValue
  unrealizedPnl: decimal('unrealized_pnl', { precision: 20, scale: 8 }).notNull(),
  realizedPnl: decimal('realized_pnl', { precision: 20, scale: 8 }).notNull(),
  exposure: decimal('exposure', { precision: 6, scale: 4 }).notNull(), // % invertido (0-1)
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  portfolioDateIdx: uniqueIndex('portfolio_snapshots_portfolio_date_idx').on(table.portfolioId, table.date),
  dateIdx: index('portfolio_snapshots_date_idx').on(table.date),
}))

// ===== TIPOS EXPORTADOS =====
export type Instrument = typeof instruments.$inferSelect
export type NewInstrument = typeof instruments.$inferInsert

export type PriceBar = typeof priceBars.$inferSelect
export type NewPriceBar = typeof priceBars.$inferInsert

export type Portfolio = typeof portfolios.$inferSelect
export type NewPortfolio = typeof portfolios.$inferInsert

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert

export type Execution = typeof executions.$inferSelect
export type NewExecution = typeof executions.$inferInsert

export type Position = typeof positions.$inferSelect
export type NewPosition = typeof positions.$inferInsert

export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect
export type NewPortfolioSnapshot = typeof portfolioSnapshots.$inferInsert
