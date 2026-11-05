import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://missing:missing@127.0.0.1/missing',
});

export const db = drizzle(pool);
