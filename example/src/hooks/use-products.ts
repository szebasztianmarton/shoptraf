import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";

import {
  deleteProduct,
  getAllProducts,
  insertProduct,
} from "@/db/product-repository";
import type { Product } from "@/db/schema";

export function useProducts() {
  const db = useSQLiteContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllProducts(db);
      setProducts(result);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const removeProduct = useCallback(
    async (id: string) => {
      await deleteProduct(db, id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    },
    [db]
  );

  const addProduct = useCallback(
    async (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
      const id = await insertProduct(db, product);
      await refresh();
      return id;
    },
    [db, refresh]
  );

  return { products, loading, refresh, removeProduct, addProduct };
}
