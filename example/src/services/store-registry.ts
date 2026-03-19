import { GENERIC_EXTRACTION_SCRIPT } from "./scrapers/generic";
import { LIDL_EXTRACTION_SCRIPT } from "./scrapers/lidl";

export interface StoreConfig {
  name: string;
  extractionScript: string;
}

const STORE_MAP: Record<string, StoreConfig> = {
  "lidl.hu": {
    name: "Lidl",
    extractionScript: LIDL_EXTRACTION_SCRIPT,
  },
};

export function getStoreConfig(url: string): StoreConfig {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    const config = STORE_MAP[hostname];
    if (config) return config;

    return {
      name: hostname,
      extractionScript: GENERIC_EXTRACTION_SCRIPT,
    };
  } catch {
    return {
      name: "Ismeretlen",
      extractionScript: GENERIC_EXTRACTION_SCRIPT,
    };
  }
}

/** Normalize URL: ensure https:// prefix */
export function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  return url;
}
