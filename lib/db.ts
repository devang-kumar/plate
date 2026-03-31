import { createClient, Client } from '@libsql/client/web';

// Convert libsql:// URL to https:// for the HTTP-based web client
function getDbUrl(): string {
  const url = process.env.DATABASE_URL || '';
  return url.replace(/^libsql:\/\//, 'https://');
}

// Only create the client if DATABASE_URL is actually set
let client: Client | null = null;

function getClient(): Client {
  if (!client) {
    const url = getDbUrl();
    if (!url) {
      throw new Error('DATABASE_URL environment variable is not set.');
    }
    client = createClient({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
  }
  return client;
}

export async function query(sql: string, params: any[] = []) {
  try {
    const result = await getClient().execute({ sql, args: params });
    return result.rows;
  } catch (error: any) {
    console.error(`Database Query Error: ${error.message}`, { sql, params });
    if (
      error.message?.includes('no such table') ||
      error.message?.includes('DATABASE_URL')
    ) {
      return [];
    }
    throw error;
  }
}

export async function get(sql: string, params: any[] = []) {
  try {
    const result = await getClient().execute({ sql, args: params });
    return result.rows[0];
  } catch (error: any) {
    console.error(`Database Get Error: ${error.message}`, { sql, params });
    if (
      error.message?.includes('no such table') ||
      error.message?.includes('DATABASE_URL')
    ) {
      return null;
    }
    throw error;
  }
}

export async function run(sql: string, params: any[] = []) {
  return getClient().execute({ sql, args: params });
}
