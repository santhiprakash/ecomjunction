import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Database connection using Neon serverless driver
const sql = neon(process.env.DATABASE_URL!);

// Export raw SQL client for custom queries
export const db = sql;

// Database query helper with type safety
export async function query<T = any>(queryString: string, params?: any[]): Promise<T[]> {
  try {
    const result = await sql(queryString, params);
    return result as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ Database connected:', result[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}
