import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDb() {
  if (db) return db;

  const dbPath = process.env.NODE_ENV === 'production'
    ? '/data/db/plates.db'
    : path.resolve(process.cwd(), 'db', 'plates.db');

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  return db;
}

export async function query(sql: string, params: any[] = []) {
  const db = await getDb();
  return db.all(sql, params);
}

export async function get(sql: string, params: any[] = []) {
  const db = await getDb();
  return db.get(sql, params);
}

export async function run(sql: string, params: any[] = []) {
  const db = await getDb();
  return db.run(sql, params);
}
