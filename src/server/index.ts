import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { instrumentsRoutes } from './routes/instruments'
import { portfoliosRoutes } from './routes/portfolios'
import { ordersRoutes } from './routes/orders'

const app = new Hono()

app.use('*', cors())

app.get('/health', (c) => c.json({ status: 'ok' }))

app.route('/api/instruments', instrumentsRoutes)
app.route('/api/portfolios', portfoliosRoutes)
app.route('/api/orders', ordersRoutes)

const port = 3001
console.log(`API server running on http://localhost:${port}`)

serve({ fetch: app.fetch, port })
