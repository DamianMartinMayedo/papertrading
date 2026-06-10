import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

// Para queries en el servidor (no serverless)
export const client = postgres(connectionString)
export const db = drizzle(client, { schema })

// Tipo para pasar la db a funciones
export type Database = typeof db
