// db/init.ts - Run once to create tables on your Turso database
// Usage: npx tsx db/init.ts
// Requires DATABASE_URL and DATABASE_AUTH_TOKEN env vars

import { createClient } from '@libsql/client/web';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL || !process.env.DATABASE_AUTH_TOKEN) {
  console.error('❌ Missing DATABASE_URL or DATABASE_AUTH_TOKEN in .env.local');
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL.replace(/^libsql:\/\//, 'https://');

const client = createClient({
  url: dbUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function init() {
  console.log('🚀 Initializing Turso database...');

  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS emirates (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS templates (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      type               TEXT    NOT NULL,
      media_url          TEXT    NOT NULL,
      media_type         TEXT    DEFAULT 'image',
      perspective_coords TEXT,
      plate_width        INTEGER DEFAULT 4
    );

    CREATE TABLE IF NOT EXISTS plate_listings (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      plate_number TEXT    NOT NULL,
      plate_code   TEXT    NOT NULL,
      emirate_id   INTEGER,
      price        REAL,
      contact_info TEXT,
      FOREIGN KEY (emirate_id) REFERENCES emirates(id)
    );
  `);

  // Seed default emirates if empty
  const existing = await client.execute('SELECT COUNT(*) as count FROM emirates');
  const count = Number((existing.rows[0] as any).count);
  if (count === 0) {
    console.log('🌍 Seeding default emirates...');
    await client.executeMultiple(`
      INSERT INTO emirates (name) VALUES ('Dubai');
      INSERT INTO emirates (name) VALUES ('Abu Dhabi');
      INSERT INTO emirates (name) VALUES ('Sharjah');
      INSERT INTO emirates (name) VALUES ('Ajman');
      INSERT INTO emirates (name) VALUES ('Ras Al Khaimah');
      INSERT INTO emirates (name) VALUES ('Fujairah');
      INSERT INTO emirates (name) VALUES ('Umm Al Quwain');
    `);
  }

  console.log('✅ Database initialized successfully!');
  process.exit(0);
}

init().catch(err => {
  console.error('❌ Init failed:', err);
  process.exit(1);
});
