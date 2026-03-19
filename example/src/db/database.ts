import type { SQLiteDatabase } from "expo-sqlite";

import { CREATE_TABLES_SQL } from "./schema";

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync("PRAGMA journal_mode = WAL");
  await db.execAsync("PRAGMA foreign_keys = ON");

  for (const sql of CREATE_TABLES_SQL) {
    await db.execAsync(sql);
  }
}
