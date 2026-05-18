import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

interface SearchResult {
  id: string;
  name: string;
  price: number;
  unit?: string;
  category: string;
  imageUrl?: string;
  store: "lidl" | "aldi";
}

// Szimulált keresési eredmények
const MOCK_RESULTS: Record<string, SearchResult[]> = {
  tej: [
    { id: "s1", name: "Mizo 2,8% tej 1L", price: 479, unit: "l", category: "Tejtermékek", store: "lidl" },
    { id: "s2", name: "Mizo laktózmentes tej 1L", price: 549, unit: "l", category: "Tejtermékek", store: "lidl" },
    { id: "s3", name: "Milbona UHT tej 2,8% 1L", price: 399, unit: "l", category: "Tejtermékek", store: "lidl" },
    { id: "s4", name: "Milfina friss tej 2,8% 1L", price: 439, unit: "l", category: "Tejtermékek", store: "aldi" },
    { id: "s5", name: "Milfina laktózmentes tej 1L", price: 529, unit: "l", category: "Tejtermékek", store: "aldi" },
  ],
  kenyér: [
    { id: "s6", name: "Kovászos kenyér 500g", price: 599, unit: "db", category: "Pékárú", store: "lidl" },
    { id: "s7", name: "Teljes kiőrlésű kenyér 500g", price: 649, unit: "db", category: "Pékárú", store: "lidl" },
    { id: "s8", name: "Rozskenyér 500g", price: 579, unit: "db", category: "Pékárú", store: "aldi" },
  ],
  csirke: [
    { id: "s9", name: "Csirkemell filé 1kg", price: 2199, unit: "kg", category: "Hús", store: "lidl" },
    { id: "s10", name: "Csirkecomb 1kg", price: 1299, unit: "kg", category: "Hús", store: "lidl" },
    { id: "s11", name: "Csirkemell filé 1kg", price: 2299, unit: "kg", category: "Hús", store: "aldi" },
    { id: "s12", name: "Csirke egész 1,5kg", price: 1899, unit: "kg", category: "Hús", store: "aldi" },
  ],
  banán: [
    { id: "s13", name: "Banán 1kg", price: 599, unit: "kg", category: "Gyümölcs", store: "lidl" },
    { id: "s14", name: "Bio banán 1kg", price: 799, unit: "kg", category: "Gyümölcs", store: "lidl" },
    { id: "s15", name: "Banán 1kg", price: 629, unit: "kg", category: "Gyümölcs", store: "aldi" },
  ],
};

// Népszerű keresések
const POPULAR_SEARCHES = [
  { label: "Tej", icon: "cup" as const, query: "tej" },
  { label: "Kenyér", icon: "bread-slice" as const, query: "kenyér" },
  { label: "Csirke", icon: "food-drumstick" as const, query: "csirke" },
  { label: "Banán", icon: "fruit-watermelon" as const, query: "banán" },
];

export default function ExploreScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const colors = useTheme();
  const [query, setQuery] = useState("");
  const [storeFilter, setStoreFilter] = useState<"all" | "lidl" | "aldi">("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: safeAreaInsets.top,
    },
    web: {
      paddingTop: Spacing.four,
    },
  });

  const handleSearch = (searchQuery?: string) => {
    const q = (searchQuery || query).trim().toLowerCase();
    if (!q) return;

    setSearching(true);
    setHasSearched(true);

    // Szimulált keresés - később API hívás
    setTimeout(() => {
      // Keresés a mock adatokban - részleges egyezés
      let allResults: SearchResult[] = [];
      for (const [key, items] of Object.entries(MOCK_RESULTS)) {
        if (key.includes(q) || q.includes(key)) {
          allResults = [...allResults, ...items];
        }
      }

      // Ha nincs találat, generálunk néhány eredményt
      if (allResults.length === 0) {
        allResults = [
          {
            id: `gen-1`,
            name: `${q} (példa termék)`,
            price: Math.floor(Math.random() * 2000) + 200,
            category: "Egyéb",
            store: "lidl",
          },
          {
            id: `gen-2`,
            name: `${q} - prémium`,
            price: Math.floor(Math.random() * 3000) + 500,
            category: "Egyéb",
            store: "aldi",
          },
        ];
      }

      setResults(allResults);
      setSearching(false);
    }, 800);
  };

  const handleTrack = (item: SearchResult) => {
    if (trackedIds.has(item.id)) {
      Alert.alert("Már figyeled", "Ez a termék már rajta van a figyelőlistádon.");
      return;
    }

    setTrackedIds((prev) => new Set(prev).add(item.id));
    Alert.alert(
      "Hozzáadva!",
      `${item.name} hozzáadva a figyelőlistádhoz.\n\nÁra: ${formatPrice(item.price)} Ft`,
      [{ text: "OK" }]
    );
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const getStoreColor = (store: string) => {
    switch (store) {
      case "lidl": return "#0050AA";
      case "aldi": return "#00599D";
      default: return "#666";
    }
  };

  const getStoreName = (store: string) => {
    switch (store) {
      case "lidl": return "Lidl";
      case "aldi": return "Aldi";
      default: return store;
    }
  };

  const filteredResults =
    storeFilter === "all"
      ? results
      : results.filter((r) => r.store === storeFilter);

  const renderResultCard = ({ item }: { item: SearchResult }) => {
    const isTracked = trackedIds.has(item.id);

    return (
      <ThemedView
        style={[styles.resultCard, { borderColor: colors.backgroundElement }]}
      >
        <View style={styles.resultLeft}>
          <View style={styles.resultNameRow}>
            <ThemedText style={styles.resultName}>{item.name}</ThemedText>
          </View>
          <View style={styles.resultMeta}>
            <View
              style={[
                styles.storeBadge,
                { backgroundColor: getStoreColor(item.store) },
              ]}
            >
              <ThemedText style={styles.storeBadgeText}>
                {getStoreName(item.store)}
              </ThemedText>
            </View>
            <ThemedText style={styles.resultCategory}>
              {item.category}
            </ThemedText>
          </View>
          <View style={styles.resultPriceRow}>
            <ThemedText style={styles.resultPrice}>
              {formatPrice(item.price)} Ft
            </ThemedText>
            {item.unit && (
              <ThemedText style={styles.resultUnit}>/ {item.unit}</ThemedText>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => handleTrack(item)}
          style={[
            styles.trackButton,
            {
              backgroundColor: isTracked ? "rgba(34, 197, 94, 0.15)" : "#208AEF",
            },
          ]}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={isTracked ? "check" : "plus"}
            size={20}
            color={isTracked ? "#16a34a" : "#fff"}
          />
          <ThemedText
            style={[
              styles.trackButtonText,
              { color: isTracked ? "#16a34a" : "#fff" },
            ]}
          >
            {isTracked ? "Követve" : "Követés"}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={[styles.container, contentPlatformStyle]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Keresés</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Keresd meg a termékeket a Lidl és Aldi kínálatából
        </ThemedText>
      </View>

      {/* Keresőmező */}
      <View
        style={[
          styles.searchBar,
          { backgroundColor: colors.backgroundElement },
        ]}
      >
        <MaterialCommunityIcons
          name="magnify"
          size={22}
          color={colors.textSecondary}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Termék keresése..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setQuery("");
              setResults([]);
              setHasSearched(false);
            }}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => handleSearch()}
          style={[styles.searchButton, { opacity: query.length > 0 ? 1 : 0.4 }]}
          disabled={query.length === 0}
        >
          <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bolt szűrő (keresés után) */}
      {hasSearched && results.length > 0 && (
        <View style={styles.filterRow}>
          {(["all", "lidl", "aldi"] as const).map((f) => {
            const count =
              f === "all"
                ? results.length
                : results.filter((r) => r.store === f).length;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setStoreFilter(f)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      storeFilter === f ? "#208AEF" : colors.backgroundElement,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.filterChipText,
                    { color: storeFilter === f ? "#fff" : colors.text },
                  ]}
                >
                  {f === "all" ? "Mind" : getStoreName(f)} ({count})
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Tartalom */}
      {searching ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#208AEF" />
          <ThemedText style={styles.loadingText}>Keresés...</ThemedText>
        </View>
      ) : hasSearched ? (
        filteredResults.length > 0 ? (
          <FlatList
            data={filteredResults}
            renderItem={renderResultCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: safeAreaInsets.bottom + BottomTabInset + 16 },
            ]}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="magnify-close"
              size={56}
              color={colors.textSecondary}
            />
            <ThemedText style={styles.emptyTitle}>
              Nincs találat
            </ThemedText>
            <ThemedText style={styles.emptyDescription}>
              Próbálj más keresőszót vagy szűrőt
            </ThemedText>
          </View>
        )
      ) : (
        /* Népszerű keresések - kezdőállapot */
        <View style={styles.popularSection}>
          <ThemedText style={styles.sectionTitle}>
            Népszerű keresések
          </ThemedText>
          <View style={styles.popularGrid}>
            {POPULAR_SEARCHES.map((item) => (
              <TouchableOpacity
                key={item.query}
                style={[
                  styles.popularCard,
                  { backgroundColor: colors.backgroundElement },
                ]}
                onPress={() => {
                  setQuery(item.query);
                  handleSearch(item.query);
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={28}
                  color="#208AEF"
                />
                <ThemedText style={styles.popularLabel}>{item.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <ThemedText style={[styles.sectionTitle, { marginTop: 24 }]}>
            Támogatott boltok
          </ThemedText>
          <View style={styles.storeCards}>
            <View
              style={[styles.storeCard, { backgroundColor: "#0050AA" }]}
            >
              <ThemedText style={styles.storeCardName}>Lidl</ThemedText>
              <ThemedText style={styles.storeCardUrl}>lidl.hu</ThemedText>
            </View>
            <View
              style={[styles.storeCard, { backgroundColor: "#00599D" }]}
            >
              <ThemedText style={styles.storeCardName}>Aldi</ThemedText>
              <ThemedText style={styles.storeCardUrl}>aldi.hu</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.hintText}>
            Írd be a termék nevét a keresőbe, vagy válassz a népszerű keresések közül.
            Az árak automatikusan frissülnek.
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 16,
    paddingTop: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 4,
  },

  // Keresőmező
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  searchButton: {
    backgroundColor: "#208AEF",
    borderRadius: 10,
    padding: 8,
  },

  // Szűrők
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Eredmény kártya
  listContent: {
    paddingTop: 4,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  resultLeft: {
    flex: 1,
    marginRight: 12,
  },
  resultNameRow: {
    marginBottom: 4,
  },
  resultName: {
    fontSize: 15,
    fontWeight: "600",
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  storeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  storeBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  resultCategory: {
    fontSize: 11,
    opacity: 0.5,
  },
  resultPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  resultPrice: {
    fontSize: 20,
    fontWeight: "800",
  },
  resultUnit: {
    fontSize: 12,
    opacity: 0.5,
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  trackButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Betöltés
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.6,
  },

  // Üres állapot
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    opacity: 0.5,
    marginTop: 8,
    textAlign: "center",
  },

  // Népszerű keresések
  popularSection: {
    flex: 1,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  popularGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  popularCard: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  popularLabel: {
    fontSize: 15,
    fontWeight: "600",
  },

  // Bolt kártyák
  storeCards: {
    flexDirection: "row",
    gap: 10,
  },
  storeCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  storeCardName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  storeCardUrl: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 4,
  },

  hintText: {
    fontSize: 13,
    opacity: 0.4,
    textAlign: "center",
    marginTop: 24,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
});
