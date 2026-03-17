import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";

export interface Product {
  id: string;
  name: string;
  currentPrice: number;
  previousPrice: number;
  minPrice: number;
  store: "lidl" | "aldi";
  category: string;
  unit?: string;
  image?: string;
  lastUpdated: string;
  priceChange: number;
  priceChangePercent: number;
}

// Dummy adatok - magyar boltok termékeivel
const DUMMY_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Mizo 2,8% tej 1L",
    currentPrice: 479,
    previousPrice: 499,
    minPrice: 449,
    store: "lidl",
    category: "Tejtermékek",
    unit: "l",
    lastUpdated: "2 perce",
    priceChange: -20,
    priceChangePercent: -4.0,
  },
  {
    id: "2",
    name: "Président vajkrém 250g",
    currentPrice: 899,
    previousPrice: 899,
    minPrice: 799,
    store: "aldi",
    category: "Tejtermékek",
    unit: "db",
    lastUpdated: "15 perce",
    priceChange: 0,
    priceChangePercent: 0,
  },
  {
    id: "3",
    name: "Csirkemell filé 1kg",
    currentPrice: 2199,
    previousPrice: 2499,
    minPrice: 1999,
    store: "lidl",
    category: "Hús",
    unit: "kg",
    lastUpdated: "1 órája",
    priceChange: -300,
    priceChangePercent: -12.0,
  },
  {
    id: "4",
    name: "Nutella 750g",
    currentPrice: 2899,
    previousPrice: 2699,
    minPrice: 2499,
    store: "aldi",
    category: "Édesség",
    unit: "db",
    lastUpdated: "3 órája",
    priceChange: 200,
    priceChangePercent: 7.4,
  },
  {
    id: "5",
    name: "Banán 1kg",
    currentPrice: 599,
    previousPrice: 649,
    minPrice: 499,
    store: "lidl",
    category: "Gyümölcs",
    unit: "kg",
    lastUpdated: "30 perce",
    priceChange: -50,
    priceChangePercent: -7.7,
  },
  {
    id: "6",
    name: "Coca-Cola 2,25L",
    currentPrice: 699,
    previousPrice: 699,
    minPrice: 599,
    store: "aldi",
    category: "Ital",
    unit: "db",
    lastUpdated: "1 órája",
    priceChange: 0,
    priceChangePercent: 0,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "lidl" | "aldi">("all");
  const colors = useTheme();

  useEffect(() => {
    setProducts(DUMMY_PRODUCTS);
  }, []);

  const filteredProducts =
    filter === "all" ? products : products.filter((p) => p.store === filter);

  const handleAddProduct = () => {
    router.push("/explore");
  };

  const handleRefresh = useCallback(() => {
    setLoading(true);
    // Szimulált frissítés - később API hívás lesz
    setTimeout(() => {
      // Random árváltozás szimulálása
      setProducts((prev) =>
        prev.map((p) => {
          const change = Math.floor(Math.random() * 100) - 50;
          const newPrice = Math.max(p.currentPrice + change, 99);
          return {
            ...p,
            previousPrice: p.currentPrice,
            currentPrice: newPrice,
            priceChange: newPrice - p.currentPrice,
            priceChangePercent: parseFloat(
              (((newPrice - p.currentPrice) / p.currentPrice) * 100).toFixed(1)
            ),
            minPrice: Math.min(p.minPrice, newPrice),
            lastUpdated: "most",
          };
        })
      );
      setLoading(false);
    }, 1200);
  }, []);

  const handleRemoveProduct = (id: string) => {
    Alert.alert("Törlés", "Biztosan törlöd ezt a terméket a figyelőlistáról?", [
      { text: "Mégse", style: "cancel" },
      {
        text: "Törlés",
        onPress: () => {
          setProducts(products.filter((p) => p.id !== id));
        },
        style: "destructive",
      },
    ]);
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const getStoreColor = (store: string) => {
    switch (store) {
      case "lidl":
        return "#0050AA";
      case "aldi":
        return "#00599D";
      default:
        return "#666";
    }
  };

  const getStoreName = (store: string) => {
    switch (store) {
      case "lidl":
        return "Lidl";
      case "aldi":
        return "Aldi";
      default:
        return store;
    }
  };

  const renderProductCard = ({ item }: { item: Product }) => {
    const isPriceDown = item.priceChange < 0;
    const isPriceUp = item.priceChange > 0;

    return (
      <ThemedView
        style={[styles.productCard, { borderColor: colors.backgroundElement }]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.productInfo}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.productName}>{item.name}</ThemedText>
            </View>
            <View style={styles.storeRow}>
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
              <ThemedText style={styles.categoryText}>
                {item.category}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleRemoveProduct(item.id)}
            style={styles.deleteButton}
          >
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.priceSection}>
          <View style={styles.priceMain}>
            <ThemedText style={styles.currentPrice}>
              {formatPrice(item.currentPrice)} Ft
            </ThemedText>
            {item.unit && (
              <ThemedText style={styles.unitText}>/ {item.unit}</ThemedText>
            )}
          </View>

          {item.priceChange !== 0 && (
            <View
              style={[
                styles.changeBadge,
                {
                  backgroundColor: isPriceDown
                    ? "rgba(34, 197, 94, 0.15)"
                    : "rgba(239, 68, 68, 0.15)",
                },
              ]}
            >
              <MaterialCommunityIcons
                name={isPriceDown ? "trending-down" : "trending-up"}
                size={16}
                color={isPriceDown ? "#16a34a" : "#dc2626"}
              />
              <ThemedText
                style={[
                  styles.changeText,
                  { color: isPriceDown ? "#16a34a" : "#dc2626" },
                ]}
              >
                {isPriceDown ? "" : "+"}
                {formatPrice(item.priceChange)} Ft
              </ThemedText>
              <ThemedText
                style={[
                  styles.changePercent,
                  { color: isPriceDown ? "#16a34a" : "#dc2626" },
                ]}
              >
                ({isPriceDown ? "" : "+"}
                {item.priceChangePercent.toFixed(1)}%)
              </ThemedText>
            </View>
          )}

          {item.priceChange === 0 && (
            <View
              style={[
                styles.changeBadge,
                { backgroundColor: "rgba(156, 163, 175, 0.15)" },
              ]}
            >
              <MaterialCommunityIcons
                name="minus"
                size={16}
                color="#6b7280"
              />
              <ThemedText style={[styles.changeText, { color: "#6b7280" }]}>
                Nem változott
              </ThemedText>
            </View>
          )}
        </View>

        <View style={[styles.statsRow, { borderTopColor: colors.backgroundElement }]}>
          <View style={styles.stat}>
            <MaterialCommunityIcons
              name="arrow-down-bold"
              size={14}
              color="#16a34a"
            />
            <View>
              <ThemedText style={styles.statLabel}>Legolcsóbb</ThemedText>
              <ThemedText style={styles.statValue}>
                {formatPrice(item.minPrice)} Ft
              </ThemedText>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.backgroundElement }]} />
          <View style={styles.stat}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={14}
              color={colors.textSecondary}
            />
            <View>
              <ThemedText style={styles.statLabel}>Frissítve</ThemedText>
              <ThemedText style={styles.statValue}>
                {item.lastUpdated}
              </ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>
    );
  };

  // Összesített statisztika
  const totalTracked = products.length;
  const priceDrops = products.filter((p) => p.priceChange < 0).length;
  const priceUps = products.filter((p) => p.priceChange > 0).length;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.headerTitle}>ShopTraf</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Árfigyelő
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={loading}
          style={[styles.refreshButton, { backgroundColor: colors.backgroundElement }]}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <MaterialCommunityIcons
              name="refresh"
              size={22}
              color={colors.text}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Összesítő sáv */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: colors.backgroundElement }]}>
          <ThemedText style={styles.summaryNumber}>{totalTracked}</ThemedText>
          <ThemedText style={styles.summaryLabel}>Termék</ThemedText>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "rgba(34, 197, 94, 0.12)" }]}>
          <ThemedText style={[styles.summaryNumber, { color: "#16a34a" }]}>
            {priceDrops}
          </ThemedText>
          <ThemedText style={[styles.summaryLabel, { color: "#16a34a" }]}>
            Csökkent
          </ThemedText>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "rgba(239, 68, 68, 0.12)" }]}>
          <ThemedText style={[styles.summaryNumber, { color: "#dc2626" }]}>
            {priceUps}
          </ThemedText>
          <ThemedText style={[styles.summaryLabel, { color: "#dc2626" }]}>
            Drágult
          </ThemedText>
        </View>
      </View>

      {/* Bolt szűrő */}
      <View style={styles.filterRow}>
        {(["all", "lidl", "aldi"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  filter === f ? "#208AEF" : colors.backgroundElement,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.filterChipText,
                { color: filter === f ? "#fff" : colors.text },
              ]}
            >
              {f === "all" ? "Mind" : getStoreName(f)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Terméklista */}
      {filteredProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="cart-off"
            size={64}
            color={colors.textSecondary}
          />
          <ThemedText style={styles.emptyTitle}>
            {filter !== "all"
              ? `Nincs ${getStoreName(filter)} termék`
              : "Nincs nyomon követett termék"}
          </ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Adj hozzá termékeket a Keresés fülön
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Hozzáadás gomb */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: "#208AEF" }]}
        onPress={handleAddProduct}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="plus" size={26} color="#fff" />
        <ThemedText style={styles.addButtonText}>Termék keresése</ThemedText>
      </TouchableOpacity>
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
    justifyContent: "space-between",
    alignItems: "center",
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
    marginTop: 2,
  },
  refreshButton: {
    padding: 10,
    borderRadius: 12,
  },

  // Összesítő sáv
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: "700",
  },
  summaryLabel: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 2,
  },

  // Szűrők
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Lista
  listContent: {
    paddingBottom: 90,
  },
  productCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  storeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  storeBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  categoryText: {
    fontSize: 12,
    opacity: 0.5,
  },
  deleteButton: {
    padding: 4,
  },
  priceSection: {
    marginBottom: 12,
  },
  priceMain: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 6,
  },
  currentPrice: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  unitText: {
    fontSize: 14,
    opacity: 0.5,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  changeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  changePercent: {
    fontSize: 12,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 12,
  },
  stat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statLabel: {
    fontSize: 10,
    opacity: 0.5,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    width: 1,
    height: 28,
    marginHorizontal: 8,
  },
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
  addButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: "#208AEF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
