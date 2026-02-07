import { PrismaClient } from '@prisma/client';

// PrismaClient singleton for Next.js
// Prevents multiple instances in development (hot reload)

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// Only initialize Prisma if DATABASE_URL is set
// This allows static pages to load even without a database
let prisma: PrismaClient | undefined;

if (process.env.DATABASE_URL) {
  prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }
}

// Export prisma, but it might be undefined if DATABASE_URL is not set
// API routes should check if prisma exists before using it
export { prisma };

// Helper to get prisma or throw error
export function getPrisma() {
  if (!prisma) {
    throw new Error('Database not configured. Please add DATABASE_URL environment variable.');
  }
  return prisma;
}
