export interface Product {
  id: string;
  name: string;
  url: string;
  store: string;
  imageUrl: string | null;
  currentPrice: number;
  previousPrice: number;
  minPrice: number;
  maxPrice: number;
  targetPrice: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface PriceRecord {
  id: string;
  productId: string;
  price: number;
  recordedAt: number;
}

export const CREATE_TABLES_SQL = [
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    store TEXT NOT NULL,
    image_url TEXT,
    current_price INTEGER NOT NULL,
    previous_price INTEGER NOT NULL,
    min_price INTEGER NOT NULL,
    max_price INTEGER NOT NULL,
    target_price INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS price_records (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    price INTEGER NOT NULL,
    recorded_at INTEGER NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_price_records_product_id ON price_records(product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_price_records_recorded_at ON price_records(recorded_at)`,
];
