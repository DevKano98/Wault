require('./env');

const { PrismaClient } = require('@prisma/client');

// Setup commands:
// npx prisma migrate dev --name init
// npx prisma generate
// npx prisma studio

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

async function testDbConnection() {
  try {
    await prisma.$connect();
    console.log('PostgreSQL connected via Prisma');
  } catch (error) {
    console.error('Failed to connect to PostgreSQL:', error);
    process.exit(1);
  }
}

testDbConnection();

module.exports = prisma;
