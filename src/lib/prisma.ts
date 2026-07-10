import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

import fs from 'fs'

function createPrismaClient() {
  const isTest  = process.env.NODE_ENV === 'test'
  const dbFile  = isTest ? 'test.db' : 'dev.db'
  const dbPath  = path.resolve(process.cwd(), 'prisma', dbFile)

  // Auto-clone dev.db to test.db for test environment to isolate tests
  if (isTest) {
    const devDbPath = path.resolve(process.cwd(), 'prisma', 'dev.db')
    if (fs.existsSync(devDbPath)) {
      try {
        fs.copyFileSync(devDbPath, dbPath)
      } catch (err) {
        console.error('Failed to clone dev.db to test.db:', err)
      }
    }
  }

  const url     = 'file:' + dbPath
  const adapter = new PrismaBetterSqlite3({ url })
  return new PrismaClient({ adapter })
}

const g = globalThis as typeof globalThis & { _prisma?: PrismaClient }
export const prisma = g._prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') g._prisma = prisma
