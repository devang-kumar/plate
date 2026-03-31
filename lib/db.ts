import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.DATABASE_URL || 'file:db/plates.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  console.warn("WARNING: DATABASE_URL is not set in production. Falling back to local SQLite file which will be read-only.");
}

export async function query(sql: string, params: any[] = []) {
  try {
    const result = await client.execute({ sql, args: params });
    return result.rows;
  } catch (error: any) {
    console.error(`Database Query Error: ${error.message}`, { sql, params });
    // Return empty array instead of crashing if tables don't exist yet
    if (error.message.includes('no such table')) {
      return [];
    }
    throw error;
  }
}

export async function get(sql: string, params: any[] = []) {
  try {
    const result = await client.execute({ sql, args: params });
    return result.rows[0];
  } catch (error: any) {
    console.error(`Database Get Error: ${error.message}`, { sql, params });
    if (error.message.includes('no such table')) {
      return null;
    }
    throw error;
  }
}

export async function run(sql: string, params: any[] = []) {
  return client.execute({ sql, args: params });
}
