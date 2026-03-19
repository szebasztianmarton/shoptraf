import React, { useCallback, useRef } from "react";
import { StyleSheet, View } from "react-native";
import WebView, { type WebViewMessageEvent } from "react-native-webview";

import { getStoreConfig } from "@/services/store-registry";

export interface ScrapedProduct {
  name: string;
  price: number; // centesimal integer
  imageUrl: string | null;
  url: string;
}

export interface ScrapeResult {
  products: ScrapedProduct[];
  store: string;
  url: string;
}

interface ScraperWebViewProps {
  url: string | null;
  onResult: (result: ScrapeResult) => void;
  onError: (error: string) => void;
}

export function ScraperWebView({ url, onResult, onError }: ScraperWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const hasReported = useRef(false);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      if (hasReported.current) return;
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "products") {
          hasReported.current = true;
          onResult({
            products: data.data || [],
            store: data.store || "Ismeretlen",
            url: data.url || url || "",
          });
        }
      } catch {
        // Ignore parse errors from other messages
      }
    },
    [onResult, url]
  );

  const handleLoadEnd = useCallback(() => {
    if (!url) return;
    const config = getStoreConfig(url);
    // Inject the extraction script after page loads
    webViewRef.current?.injectJavaScript(config.extractionScript);
  }, [url]);

  const handleError = useCallback(() => {
    if (hasReported.current) return;
    hasReported.current = true;
    onError("Az oldal nem tölthető be. Ellenőrizd az URL-t.");
  }, [onError]);

  // Reset when URL changes
  if (url) {
    hasReported.current = false;
  }

  if (!url) return null;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        onLoadEnd={handleLoadEnd}
        onMessage={handleMessage}
        onError={handleError}
        onHttpError={handleError}
        javaScriptEnabled
        domStorageEnabled
        userAgent="Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 0,
    height: 0,
    overflow: "hidden",
  },
  webview: {
    width: 1,
    height: 1,
  },
});
