import { createClient } from '@libsql/client/web';

// Convert libsql:// URL to https:// for the HTTP-based web client
// This works on Vercel serverless without needing native bindings
function getDbUrl(): string {
  const url = process.env.DATABASE_URL || '';
  return url.replace(/^libsql:\/\//, 'https://');
}

const client = createClient({
  url: getDbUrl() || 'https://localhost',
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  console.error('ERROR: DATABASE_URL is not set in production!');
}

export async function query(sql: string, params: any[] = []) {
  try {
    const result = await client.execute({ sql, args: params });
    return result.rows;
  } catch (error: any) {
    console.error(`Database Query Error: ${error.message}`, { sql, params });
    if (error.message?.includes('no such table')) {
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
    if (error.message?.includes('no such table')) {
      return null;
    }
    throw error;
  }
}

export async function run(sql: string, params: any[] = []) {
  return client.execute({ sql, args: params });
}
