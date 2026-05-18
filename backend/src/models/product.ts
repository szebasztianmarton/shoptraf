export interface ScrapedProduct {
  id: string;
  externalId: string;
  name: string;
  brand: string | null;
  category: string | null;
  currentPrice: number;
  unit: string | null;
  pricePerUnit: number | null;
  imageUrl: string | null;
  productUrl: string;
  store: 'lidl' | 'aldi';
  lastScrapedAt: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  price: number;
  scrapedAt: string;
}

export interface ProductWithHistory {
  id: string;
  name: string;
  currentPrice: number;
  previousPrice: number;
  minPrice: number;
  store: string;
  image: string | null;
  lastUpdated: string;
  priceChange: number;
  priceChangePercent: number;
}

export interface SearchRequest {
  store: string;
  query: string;
}

export interface TrackRequest {
  productUrl: string;
  store: string;
  name: string;
  price: number;
  imageUrl?: string;
  externalId?: string;
}
