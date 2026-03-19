import type { SQLiteDatabase } from "expo-sqlite";

import type { PriceRecord } from "./schema";

function rowToPriceRecord(row: Record<string, unknown>): PriceRecord {
  return {
    id: row.id as string,
    productId: row.product_id as string,
    price: row.price as number,
    recordedAt: row.recorded_at as number,
  };
}

export async function getPriceHistory(
  db: SQLiteDatabase,
  productId: string,
  days?: number
): Promise<PriceRecord[]> {
  let sql = "SELECT * FROM price_records WHERE product_id = ?";
  const params: (string | number)[] = [productId];

  if (days) {
    const since = Date.now() - days * 24 * 60 * 60 * 1000;
    sql += " AND recorded_at >= ?";
    params.push(since);
  }

  sql += " ORDER BY recorded_at ASC";

  const rows = await db.getAllAsync(sql, params);
  return (rows as Record<string, unknown>[]).map(rowToPriceRecord);
}

export async function getLatestPrice(
  db: SQLiteDatabase,
  productId: string
): Promise<number | null> {
  const row = await db.getFirstAsync(
    "SELECT price FROM price_records WHERE product_id = ? ORDER BY recorded_at DESC LIMIT 1",
    [productId]
  ) as Record<string, unknown> | null;

  return row ? (row.price as number) : null;
}
