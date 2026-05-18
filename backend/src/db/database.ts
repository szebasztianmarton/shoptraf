import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', '..', 'shoptraf.db');

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
  }
  return db;
}

function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      external_id TEXT,
      name TEXT NOT NULL,
      brand TEXT,
      category TEXT,
      current_price INTEGER NOT NULL,
      unit TEXT,
      price_per_unit INTEGER,
      image_url TEXT,
      product_url TEXT NOT NULL UNIQUE,
      store TEXT NOT NULL,
      last_scraped_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      price INTEGER NOT NULL,
      scraped_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_price_history_product
      ON price_history(product_id, scraped_at);
  `);
}

export function closeDatabase(): void {
  if (db) {
    db.close();
  }
}
