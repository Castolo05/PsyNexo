import { PrismaClient } from '@prisma/client'

// Patrón Singleton: reutilizar la misma instancia en toda la app
// Evita crear demasiadas conexiones a la BD en desarrollo con hot reload

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
