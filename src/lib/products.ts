import { supabase } from '@/lib/supabase';
import { Product } from '@/types/product';

function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'most';
  if (diffMinutes < 60) return `${diffMinutes} perce`;
  if (diffHours < 24) return `${diffHours} órája`;
  return `${diffDays} napja`;
}

export async function fetchUserProducts(userId: string): Promise<Product[]> {
  // Fetch tracked products
  const { data: products, error: productsError } = await supabase
    .from('tracked_products')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (productsError) throw new Error(productsError.message);
  if (!products || products.length === 0) return [];

  // Fetch all price history for these products
  const productIds = products.map((p) => p.id);
  const { data: prices, error: pricesError } = await supabase
    .from('price_history')
    .select('*')
    .in('product_id', productIds)
    .order('recorded_at', { ascending: false });

  if (pricesError) throw new Error(pricesError.message);

  // Map to Product interface
  return products.map((product) => {
    const productPrices = (prices || [])
      .filter((p) => p.product_id === product.id)
      .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());

    const currentPrice = productPrices[0]?.price ?? 0;
    const previousPrice = productPrices[1]?.price ?? currentPrice;
    const minPrice = productPrices.length > 0
      ? Math.min(...productPrices.map((p) => p.price))
      : 0;
    const priceChange = currentPrice - previousPrice;
    const priceChangePercent = previousPrice > 0
      ? Math.round(((currentPrice - previousPrice) / previousPrice) * 1000) / 10
      : 0;

    return {
      id: product.id,
      name: product.name,
      store: product.store,
      image: product.image,
      currentPrice,
      previousPrice,
      minPrice,
      lastUpdated: productPrices[0]?.recorded_at
        ? formatTimeAgo(productPrices[0].recorded_at)
        : 'nincs adat',
      priceChange,
      priceChangePercent,
    };
  });
}

export async function addProduct(
  userId: string,
  name: string,
  store: string,
  initialPrice: number,
): Promise<Product> {
  const { data: product, error: productError } = await supabase
    .from('tracked_products')
    .insert({ user_id: userId, name, store })
    .select()
    .single();

  if (productError) throw new Error(productError.message);

  const { error: priceError } = await supabase
    .from('price_history')
    .insert({ product_id: product.id, price: initialPrice });

  if (priceError) throw new Error(priceError.message);

  return {
    id: product.id,
    name: product.name,
    store: product.store,
    image: product.image,
    currentPrice: initialPrice,
    previousPrice: initialPrice,
    minPrice: initialPrice,
    lastUpdated: 'most',
    priceChange: 0,
    priceChangePercent: 0,
  };
}

export async function removeProduct(productId: string): Promise<void> {
  const { error } = await supabase
    .from('tracked_products')
    .delete()
    .eq('id', productId);

  if (error) throw new Error(error.message);
}

export async function addPriceRecord(productId: string, price: number): Promise<void> {
  const { error } = await supabase
    .from('price_history')
    .insert({ product_id: productId, price });

  if (error) throw new Error(error.message);
}
