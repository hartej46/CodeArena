// backend/src/prisma.js
// Singleton Prisma Client instance with PrismaPg adapter for Prisma 7

require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

let prisma = null;

function getPrisma() {
  if (!prisma) {
    const connectionString =
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/codearena?sslmode=require';

    const pool = new Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=require') || connectionString.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : false,
    });

    const adapter = new PrismaPg(pool);

    prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return prisma;
}

module.exports = {
  prisma: getPrisma(),
  getPrisma,
};
