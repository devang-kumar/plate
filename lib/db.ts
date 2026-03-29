import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.DATABASE_URL || 'file:db/plates.db',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  console.warn("WARNING: DATABASE_URL is not set in production. Falling back to local SQLite file which will be read-only.");
}

export async function query(sql: string, params: any[] = []) {
  const result = await client.execute({ sql, args: params });
  return result.rows;
}

export async function get(sql: string, params: any[] = []) {
  const result = await client.execute({ sql, args: params });
  return result.rows[0];
}

export async function run(sql: string, params: any[] = []) {
  return client.execute({ sql, args: params });
}
