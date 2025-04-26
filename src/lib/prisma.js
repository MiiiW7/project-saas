import { PrismaClient } from '../generated/prisma'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Function to check database connection
export async function checkDatabaseConnection() {
  try {
    // Run a simple query to check connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection is working');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

export default prisma;