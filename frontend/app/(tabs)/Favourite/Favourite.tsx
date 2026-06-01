import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from "react-native";
import React, { useMemo } from "react";
import * as Haptics from "expo-haptics";
import { useGetFavoriteDestinations, useToggleFavorite } from "@/hooks/destination.hook";
import { Destination } from "@/Utils/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { optimizeImage } from "@/Utils/optimizeImage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, AppColors } from "@/context/ThemeContext";
import FavouriteSkeleton from "@/components/skeletons/FavouriteSkeleton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 12;
const H_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.3;

// ── Individual favourite card ─────────────────────────────────
const FavouriteCard = ({ item }: { item: Destination }) => {
  const router = useRouter();
  const { isDark, colors: C } = useTheme();
  const { mutate: toggleFavorite, isPending } = useToggleFavorite();
  const styles = useMemo(() => createStyles(C, isDark), [isDark]);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({
          pathname: "/(modals)/[DestinationId]",
          params: { DestinationId: String(item.id) },
        });
      }}
    >
      <Image
        source={{ uri: optimizeImage(item.images[0], { width: 400, quality: 75 }) }}
        style={styles.cardImage}
        contentFit="cover"
      />
      <View style={styles.overlay}>
        {item.tags?.length > 0 && (
          <Text style={styles.tagText} numberOfLines={1}>
            {item.tags.slice(0, 2).map((t) => `#${t}`).join("  ")}
          </Text>
        )}
        <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.regionRow}>
          <Ionicons name="location-sharp" size={10} color="rgba(255,255,255,0.7)" />
          <Text style={styles.regionText} numberOfLines={1}>{item.region}</Text>
        </View>
      </View>
      <View style={styles.ratingBadge}>
        <Ionicons name="star" size={10} color={C.secondary[500]} />
        <Text style={styles.ratingText}>{item.rating?.toFixed(1)}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); toggleFavorite(item.id); }}
        disabled={isPending}
        activeOpacity={0.8}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        {isPending ? (
          <ActivityIndicator size="small" color={C.primary[500]} />
        ) : (
          <Ionicons name="bookmark" size={16} color={C.primary[500]} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// ── Empty state ───────────────────────────────────────────────
const EmptyState = () => {
  const router = useRouter();
  const { isDark, colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C, isDark), [isDark]);
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="bookmark-outline" size={36} color={C.primary[500]} />
      </View>
      <Text style={styles.emptyTitle}>No favourites yet</Text>
      <Text style={styles.emptyBody}>
        Tap the bookmark on any destination{"\n"}to save it here.
      </Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        activeOpacity={0.85}
        onPress={() => router.push("/(tabs)")}
      >
        <Text style={styles.emptyBtnText}>Explore destinations</Text>
      </TouchableOpacity>
    </View>
  );
};

// ── Screen ────────────────────────────────────────────────────
const Favourite = () => {
  const { data, isLoading, refetch, isRefetching } = useGetFavoriteDestinations();
  const { top } = useSafeAreaInsets();
  const { isDark, colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C, isDark), [isDark]);
  const favourites: Destination[] = data?.data ?? [];

  if (isLoading) return <FavouriteSkeleton />;

  return (
    <View style={[styles.root, { paddingTop: top }]}>
      <FlatList
        data={favourites}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={C.primary[500]}
            colors={[C.primary[500]]}
          />
        }
        renderItem={({ item }) => <FavouriteCard item={item} />}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Favourites</Text>
            {favourites.length > 0 && (
              <View style={styles.countPill}>
                <Text style={styles.countText}>{favourites.length} saved</Text>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<EmptyState />}
      />
    </View>
  );
};

export default Favourite;

// ── Styles factory ────────────────────────────────────────────
const createStyles = (C: AppColors, isDark: boolean) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: C.background },
    listContent: { paddingHorizontal: H_PADDING, paddingBottom: 120, flexGrow: 1 },
    row: { gap: CARD_GAP, marginBottom: CARD_GAP },

    header: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 8, paddingBottom: 18 },
    headerTitle: { fontFamily: "PoppinsBold", fontSize: 28, color: C.dark },
    countPill: {
      backgroundColor: C.primary[50], borderWidth: 1, borderColor: C.primary[100],
      borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
    },
    countText: { fontFamily: "PoppinsSemiBold", fontSize: 11, color: C.primary[600] },

    card: { width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 18, overflow: "hidden", backgroundColor: C.primary[100] },
    cardImage: { width: "100%", height: "100%", position: "absolute" },
    overlay: {
      position: "absolute", bottom: 0, left: 0, right: 0,
      padding: 10, paddingTop: 24,
      backgroundColor: "rgba(0,0,0,0.38)",
      borderBottomLeftRadius: 18, borderBottomRightRadius: 18,
    },
    tagText: { fontFamily: "PoppinsRegular", fontSize: 9, color: "rgba(255,255,255,0.65)", letterSpacing: 0.3, marginBottom: 2 },
    cardName: { fontFamily: "PoppinsBold", fontSize: 13, color: "#fff", lineHeight: 17 },
    regionRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 3 },
    regionText: { fontFamily: "PoppinsRegular", fontSize: 10, color: "rgba(255,255,255,0.7)", flex: 1 },

    ratingBadge: {
      position: "absolute", top: 8, left: 8,
      flexDirection: "row", alignItems: "center", gap: 3,
      backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 20,
      paddingHorizontal: 7, paddingVertical: 3,
    },
    ratingText: { fontFamily: "PoppinsSemiBold", fontSize: 10, color: "#fff" },

    removeBtn: {
      position: "absolute", top: 8, right: 8,
      width: 30, height: 30, borderRadius: 15,
      backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.9)",
      alignItems: "center", justifyContent: "center",
    },

    loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },

    emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, paddingTop: 60 },
    emptyIconWrap: {
      width: 76, height: 76, borderRadius: 38,
      backgroundColor: C.primary[50], borderWidth: 1, borderColor: C.primary[100],
      alignItems: "center", justifyContent: "center", marginBottom: 16,
    },
    emptyTitle: { fontFamily: "PoppinsBold", fontSize: 20, color: C.dark, marginBottom: 8 },
    emptyBody: { fontFamily: "PoppinsRegular", fontSize: 14, color: C.muted, textAlign: "center", lineHeight: 22, marginBottom: 24 },
    emptyBtn: { backgroundColor: C.primary[500], borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
    emptyBtnText: { fontFamily: "PoppinsBold", fontSize: 14, color: "#fff" },
  });
