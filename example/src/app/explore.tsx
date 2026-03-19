import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ScraperWebView,
  type ScrapedProduct,
  type ScrapeResult,
} from "@/components/scraper-webview";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useProducts } from "@/hooks/use-products";
import { useTheme } from "@/hooks/use-theme";
import { normalizeUrl } from "@/services/store-registry";
import { formatPrice } from "@/utils/format";

type Screen = "input" | "scraping" | "results" | "manual";

export default function ExploreScreen() {
  const router = useRouter();
  const colors = useTheme();
  const { addProduct } = useProducts();

  const [urlInput, setUrlInput] = useState("");
  const [screen, setScreen] = useState<Screen>("input");
  const [scrapeUrl, setScrapeUrl] = useState<string | null>(null);
  const [scrapedProducts, setScrapedProducts] = useState<ScrapedProduct[]>([]);
  const [storeName, setStoreName] = useState("");
  const [saving, setSaving] = useState(false);

  // Manual entry state
  const [manualName, setManualName] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualUrl, setManualUrl] = useState("");

  const handleScrape = useCallback(() => {
    const url = normalizeUrl(urlInput);
    try {
      new URL(url); // validate
    } catch {
      Alert.alert("Hiba", "Kérlek adj meg egy érvényes URL-t.");
      return;
    }
    Keyboard.dismiss();
    setScrapeUrl(url);
    setScreen("scraping");
  }, [urlInput]);

  const handleScrapeResult = useCallback((result: ScrapeResult) => {
    setStoreName(result.store);
    if (result.products.length > 0) {
      setScrapedProducts(result.products);
      setScreen("results");
    } else {
      // No products found — offer manual entry with URL pre-filled
      setManualUrl(result.url);
      Alert.alert(
        "Nem találtam terméket",
        "Az oldal nem tartalmazott felismerhető termékadatot. Kézzel is megadhatod.",
        [
          { text: "Kézi bevitel", onPress: () => setScreen("manual") },
          { text: "Mégse", onPress: () => resetToInput() },
        ]
      );
    }
  }, []);

  const handleScrapeError = useCallback((error: string) => {
    Alert.alert("Hiba", error, [
      { text: "Kézi bevitel", onPress: () => setScreen("manual") },
      { text: "Mégse", onPress: () => resetToInput() },
    ]);
  }, []);

  const resetToInput = () => {
    setScreen("input");
    setScrapeUrl(null);
    setScrapedProducts([]);
    setManualName("");
    setManualPrice("");
    setManualUrl("");
  };

  const handleSaveProduct = async (product: ScrapedProduct) => {
    setSaving(true);
    try {
      await addProduct({
        name: product.name,
        url: product.url,
        store: storeName,
        imageUrl: product.imageUrl,
        currentPrice: product.price,
        previousPrice: product.price,
        minPrice: product.price,
        maxPrice: product.price,
        targetPrice: null,
      });
      Alert.alert("Mentve!", `${product.name} hozzáadva a követéshez.`, [
        { text: "OK", onPress: () => resetToInput() },
      ]);
      router.push("/");
    } catch {
      Alert.alert("Hiba", "Nem sikerült menteni a terméket.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveManual = async () => {
    if (!manualName.trim()) {
      Alert.alert("Hiba", "Add meg a termék nevét.");
      return;
    }
    const price = parseFloat(manualPrice.replace(/\s/g, "").replace(",", "."));
    if (isNaN(price) || price <= 0) {
      Alert.alert("Hiba", "Add meg a termék árát számként (pl. 329).");
      return;
    }

    const priceInt = Math.round(price * 100);
    await handleSaveProduct({
      name: manualName.trim(),
      price: priceInt,
      imageUrl: null,
      url: manualUrl || urlInput,
    });
  };

  const renderScrapedProduct = ({ item }: { item: ScrapedProduct }) => (
    <ThemedView
      style={[styles.productCard, { borderColor: colors.backgroundElement }]}
    >
      <ThemedText style={styles.productName}>{item.name}</ThemedText>
      <ThemedText style={styles.productPrice}>
        {formatPrice(item.price)} Ft
      </ThemedText>
      <ThemedText style={styles.productStore}>{storeName}</ThemedText>
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: "#208AEF" }]}
        onPress={() => handleSaveProduct(item)}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
            <ThemedText style={styles.saveButtonText}>Követés</ThemedText>
          </>
        )}
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Termék hozzáadása</ThemedText>
        {screen !== "input" && (
          <TouchableOpacity onPress={resetToInput} style={styles.backButton}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Input screen */}
      {screen === "input" && (
        <View style={styles.inputSection}>
          <ThemedText style={styles.label}>Termék URL beillesztése</ThemedText>
          <ThemedText style={styles.hint}>
            Másold be a termék linkjét (pl. lidl.hu, emag.hu, alza.hu)
          </ThemedText>
          <View
            style={[
              styles.inputRow,
              { borderColor: colors.backgroundElement },
            ]}
          >
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="https://www.lidl.hu/..."
              placeholderTextColor={colors.textSecondary}
              value={urlInput}
              onChangeText={setUrlInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="go"
              onSubmitEditing={handleScrape}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.scrapeButton,
              {
                backgroundColor: urlInput.trim() ? "#208AEF" : colors.backgroundElement,
              },
            ]}
            onPress={handleScrape}
            disabled={!urlInput.trim()}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color={urlInput.trim() ? "#fff" : colors.textSecondary}
            />
            <ThemedText
              style={[
                styles.scrapeButtonText,
                {
                  color: urlInput.trim() ? "#fff" : colors.textSecondary,
                },
              ]}
            >
              Termék keresése
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => setScreen("manual")}
          >
            <MaterialCommunityIcons
              name="pencil"
              size={18}
              color={colors.textSecondary}
            />
            <ThemedText
              style={[styles.manualButtonText, { color: colors.textSecondary }]}
            >
              Kézi bevitel
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Scraping screen */}
      {screen === "scraping" && (
        <View style={styles.loadingSection}>
          <ActivityIndicator size="large" color="#208AEF" />
          <ThemedText style={styles.loadingText}>
            Termék keresése...
          </ThemedText>
          <ThemedText style={styles.loadingHint}>
            Az oldal betöltése eltarthat néhány másodpercig
          </ThemedText>
        </View>
      )}

      {/* Results screen */}
      {screen === "results" && (
        <View style={styles.resultsSection}>
          <ThemedText style={styles.resultsTitle}>
            {scrapedProducts.length} termék találat
          </ThemedText>
          <FlatList
            data={scrapedProducts}
            renderItem={renderScrapedProduct}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={styles.resultsList}
          />
        </View>
      )}

      {/* Manual entry screen */}
      {screen === "manual" && (
        <View style={styles.inputSection}>
          <ThemedText style={styles.label}>Termék neve</ThemedText>
          <TextInput
            style={[
              styles.manualInput,
              { color: colors.text, borderColor: colors.backgroundElement },
            ]}
            placeholder="pl. Pilos teljes tej 2,8%"
            placeholderTextColor={colors.textSecondary}
            value={manualName}
            onChangeText={setManualName}
          />

          <ThemedText style={[styles.label, { marginTop: 16 }]}>
            Ár (Ft)
          </ThemedText>
          <TextInput
            style={[
              styles.manualInput,
              { color: colors.text, borderColor: colors.backgroundElement },
            ]}
            placeholder="pl. 329"
            placeholderTextColor={colors.textSecondary}
            value={manualPrice}
            onChangeText={setManualPrice}
            keyboardType="numeric"
          />

          <ThemedText style={[styles.label, { marginTop: 16 }]}>
            URL (opcionális)
          </ThemedText>
          <TextInput
            style={[
              styles.manualInput,
              { color: colors.text, borderColor: colors.backgroundElement },
            ]}
            placeholder="https://..."
            placeholderTextColor={colors.textSecondary}
            value={manualUrl || urlInput}
            onChangeText={setManualUrl}
            autoCapitalize="none"
            keyboardType="url"
          />

          <TouchableOpacity
            style={[styles.scrapeButton, { backgroundColor: "#208AEF", marginTop: 24 }]}
            onPress={handleSaveManual}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
                <ThemedText style={styles.scrapeButtonText}>Mentés</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Hidden WebView for scraping */}
      <ScraperWebView
        url={screen === "scraping" ? scrapeUrl : null}
        onResult={handleScrapeResult}
        onError={handleScrapeError}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingTop: 16,
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  inputSection: {
    paddingTop: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  hint: {
    fontSize: 13,
    opacity: 0.6,
    marginBottom: 16,
  },
  inputRow: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 16,
  },
  textInput: {
    fontSize: 15,
    paddingVertical: 12,
  },
  scrapeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  scrapeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  manualButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 12,
    gap: 6,
  },
  manualButtonText: {
    fontSize: 14,
  },
  loadingSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
  },
  loadingHint: {
    fontSize: 13,
    opacity: 0.6,
  },
  resultsSection: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  resultsList: {
    paddingBottom: 40,
  },
  productCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 6,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
  },
  productPrice: {
    fontSize: 22,
    fontWeight: "700",
  },
  productStore: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 8,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  manualInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
});
