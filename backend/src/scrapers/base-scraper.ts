import axios, { AxiosInstance } from 'axios';
import { ScrapedProduct } from '../models/product';

export abstract class BaseScraper {
  abstract readonly storeName: 'lidl' | 'aldi';
  abstract readonly baseUrl: string;

  protected client: AxiosInstance;
  private lastRequestTime: number = 0;
  private readonly minDelay: number = 2000; // 2 seconds between requests

  constructor() {
    this.client = axios.create({
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'hu-HU,hu;q=0.9,en;q=0.8',
      },
    });
  }

  abstract searchProducts(query: string): Promise<ScrapedProduct[]>;
  abstract scrapeProductPage(url: string): Promise<ScrapedProduct | null>;

  protected async fetchHtml(url: string): Promise<string> {
    await this.rateLimit();
    const response = await this.client.get(url);
    return response.data;
  }

  protected async fetchJson(url: string): Promise<any> {
    await this.rateLimit();
    const response = await this.client.get(url);
    return response.data;
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minDelay) {
      await new Promise(resolve => setTimeout(resolve, this.minDelay - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Parse Hungarian price formats:
   * "1 299 Ft" → 1299
   * "1.299 Ft" → 1299
   * "1299,-"   → 1299
   * "1 299"    → 1299
   */
  protected parsePrice(priceText: string): number {
    const cleaned = priceText
      .replace(/Ft/gi, '')
      .replace(/,-/g, '')
      .replace(/[.\s\u00a0]/g, '') // spaces, non-breaking spaces, dots
      .trim();
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? 0 : num;
  }
}
