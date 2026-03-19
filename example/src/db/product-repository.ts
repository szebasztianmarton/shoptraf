import type { SQLiteDatabase } from "expo-sqlite";
import * as crypto from "expo-crypto";

import type { Product } from "./schema";

function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    url: row.url as string,
    store: row.store as string,
    imageUrl: row.image_url as string | null,
    currentPrice: row.current_price as number,
    previousPrice: row.previous_price as number,
    minPrice: row.min_price as number,
    maxPrice: row.max_price as number,
    targetPrice: row.target_price as number | null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

export async function getAllProducts(
  db: SQLiteDatabase
): Promise<Product[]> {
  const rows = await db.getAllAsync("SELECT * FROM products ORDER BY updated_at DESC");
  return (rows as Record<string, unknown>[]).map(rowToProduct);
}

export async function getProductById(
  db: SQLiteDatabase,
  id: string
): Promise<Product | null> {
  const row = await db.getFirstAsync("SELECT * FROM products WHERE id = ?", [id]);
  return row ? rowToProduct(row as Record<string, unknown>) : null;
}

export async function insertProduct(
  db: SQLiteDatabase,
  product: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const id = crypto.randomUUID();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO products (id, name, url, store, image_url, current_price, previous_price, min_price, max_price, target_price, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      product.name,
      product.url,
      product.store,
      product.imageUrl,
      product.currentPrice,
      product.previousPrice,
      product.minPrice,
      product.maxPrice,
      product.targetPrice,
      now,
      now,
    ]
  );

  // Insert initial price record
  await db.runAsync(
    `INSERT INTO price_records (id, product_id, price, recorded_at) VALUES (?, ?, ?, ?)`,
    [crypto.randomUUID(), id, product.currentPrice, now]
  );

  return id;
}

export async function updateProductPrice(
  db: SQLiteDatabase,
  id: string,
  newPrice: number
): Promise<void> {
  const now = Date.now();
  const product = await getProductById(db, id);
  if (!product) return;

  const newMin = Math.min(product.minPrice, newPrice);
  const newMax = Math.max(product.maxPrice, newPrice);

  await db.runAsync(
    `UPDATE products SET previous_price = current_price, current_price = ?, min_price = ?, max_price = ?, updated_at = ? WHERE id = ?`,
    [newPrice, newMin, newMax, now, id]
  );

  await db.runAsync(
    `INSERT INTO price_records (id, product_id, price, recorded_at) VALUES (?, ?, ?, ?)`,
    [crypto.randomUUID(), id, newPrice, now]
  );
}

export async function deleteProduct(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync("DELETE FROM price_records WHERE product_id = ?", [id]);
  await db.runAsync("DELETE FROM products WHERE id = ?", [id]);
}

export async function setTargetPrice(
  db: SQLiteDatabase,
  id: string,
  price: number | null
): Promise<void> {
  await db.runAsync("UPDATE products SET target_price = ? WHERE id = ?", [price, id]);
}
