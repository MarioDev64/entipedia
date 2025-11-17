import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

/**
 * Database connection for Neon PostgreSQL
 * Uses neon-http driver for serverless compatibility on Vercel
 */

// Check if DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

// Create SQL connection using Neon's HTTP driver
const sql = neon(process.env.DATABASE_URL);

// Create and export typed Drizzle instance
export const db = drizzle(sql, { schema });

// Export the type for use in other files
export type DbType = typeof db;
