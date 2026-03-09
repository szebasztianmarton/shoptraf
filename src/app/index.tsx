import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

interface Product {
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

export default function HomeScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const colors = useTheme();

  // Dummy adatok a kezdéshez
  useEffect(() => {
    setProducts([
      {
        id: "1",
        name: "iPhone 15 Pro Max",
        currentPrice: 349999,
        previousPrice: 379999,
        minPrice: 329999,
        store: "ElectroShop",
        lastUpdated: "2 órája",
        priceChange: -30000,
        priceChangePercent: -7.9,
      },
      {
        id: "2",
        name: "Samsung Galaxy S24",
        currentPrice: 299999,
        previousPrice: 299999,
        minPrice: 279999,
        store: "TechMart",
        lastUpdated: "5 órája",
        priceChange: 0,
        priceChangePercent: 0,
      },
      {
        id: "3",
        name: 'MacBook Pro 14"',
        currentPrice: 899999,
        previousPrice: 919999,
        minPrice: 879999,
        store: "AppleStore",
        lastUpdated: "1 órája",
        priceChange: -20000,
        priceChangePercent: -2.2,
      },
    ]);
  }, []);

  const handleAddProduct = () => {
    router.push("/explore");
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Siker", "Árak frissítve!");
    }, 1500);
  };

  const handleRemoveProduct = (id: string) => {
    Alert.alert("Törlés", "Biztosan törlöd ezt a terméket?", [
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
    return (price / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
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
            <ThemedText style={styles.productName}>{item.name}</ThemedText>
            <ThemedText style={styles.storeName}>{item.store}</ThemedText>
          </View>
          <TouchableOpacity
            onPress={() => handleRemoveProduct(item.id)}
            style={styles.deleteButton}
          >
            <MaterialCommunityIcons
              name="close"
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.priceSection}>
          <View>
            <ThemedText style={styles.currentLabel}>Jelenlegi ár</ThemedText>
            <ThemedText style={styles.currentPrice}>
              {formatPrice(item.currentPrice)} Ft
            </ThemedText>
          </View>

          {item.priceChange !== 0 && (
            <View
              style={[
                styles.changeBadge,
                {
                  backgroundColor: isPriceDown ? "#d4edda" : "#f8d7da",
                },
              ]}
            >
              <MaterialCommunityIcons
                name={isPriceDown ? "arrow-down" : "arrow-up"}
                size={16}
                color={isPriceDown ? "#155724" : "#721c24"}
              />
              <ThemedText
                style={[
                  styles.changeText,
                  { color: isPriceDown ? "#155724" : "#721c24" },
                ]}
              >
                {isPriceDown ? "-" : "+"}
                {formatPrice(Math.abs(item.priceChange))} Ft
              </ThemedText>
              <ThemedText
                style={[
                  styles.changePercent,
                  { color: isPriceDown ? "#155724" : "#721c24" },
                ]}
              >
                ({isPriceDown ? "-" : "+"}
                {Math.abs(item.priceChangePercent).toFixed(1)}%)
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <ThemedText style={styles.statLabel}>Minimum ár</ThemedText>
            <ThemedText style={styles.statValue}>
              {formatPrice(item.minPrice)} Ft
            </ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <ThemedText style={styles.statLabel}>Frissítve</ThemedText>
            <ThemedText style={styles.statValue}>{item.lastUpdated}</ThemedText>
          </View>
        </View>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.headerTitle}>ShopTraf</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {products.length} termék követése
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={loading}
          style={styles.refreshButton}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <MaterialCommunityIcons
              name="refresh"
              size={24}
              color={colors.text}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      {products.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="shopping-outline"
            size={64}
            color={colors.text}
            style={{ opacity: 0.5 }}
          />
          <ThemedText style={styles.emptyTitle}>
            Nincsenek nyomon követett termékek
          </ThemedText>
          <ThemedText style={styles.emptyDescription}>
            Adj hozzá termékeket az ár monitorozásához
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      )}

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: "#208AEF" }]}
        onPress={handleAddProduct}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
        <ThemedText style={styles.addButtonText}>Termék hozzáadása</ThemedText>
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
    paddingVertical: 20,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  productCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  storeName: {
    fontSize: 12,
    opacity: 0.6,
  },
  deleteButton: {
    padding: 4,
  },
  priceSection: {
    marginBottom: 12,
  },
  currentLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: 12,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.6,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginHorizontal: 12,
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
    opacity: 0.6,
    marginTop: 8,
    textAlign: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
