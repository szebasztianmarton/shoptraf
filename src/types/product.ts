export interface Product {
  id: string;
  name: string;
  currentPrice: number;
  previousPrice: number;
  minPrice: number;
  store: string;
  image?: string;
  lastUpdated: string;
  priceChange: number;
  priceChangePercent: number;
}
