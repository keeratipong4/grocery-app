import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

function createPrismaClient() {
  const url     = 'file:' + path.resolve(process.cwd(), 'prisma/dev.db')
  const adapter = new PrismaBetterSqlite3({ url })
  return new PrismaClient({ adapter })
}

const g = globalThis as typeof globalThis & { _prisma?: PrismaClient }
export const prisma = g._prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') g._prisma = prisma
