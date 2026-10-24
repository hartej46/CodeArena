// backend/src/lib/prisma.js
require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/codearena?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl:
    connectionString.includes('sslmode=require') || connectionString.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : false,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
