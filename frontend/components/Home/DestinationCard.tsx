import {
  Dimensions,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useMemo } from "react";
import { Destination } from "@/Utils/types";
import { Ionicons } from "@expo/vector-icons";
import GhanaFlag from "@/assets/images/ghanaFlag.png";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { optimizeImage } from "@/Utils/optimizeImage";
import { useToggleFavorite } from "@/hooks/destination.hook";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColors } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");

const DestinationCard = ({
  item,
  widthIncrement = 0,
  height,
  isFavorited,
}: {
  item: Destination;
  widthIncrement?: number;
  height?: number;
  isFavorited?: (destinationId: string) => boolean;
}) => {
  const router = useRouter();
  const C = useThemeColors();
  const { mutate: toggleFavorite, isPending: togglingFavorite } = useToggleFavorite();
  const isFavorite = isFavorited ? isFavorited(item.id) : false;

  return (
    <TouchableOpacity
      activeOpacity={0.93}
      style={[
        styles.card,
        { width: width * 0.72 + widthIncrement, height: height || "100%" },
      ]}
      onPress={() =>
        router.push({
          pathname: "/(modals)/[DestinationId]",
          params: { DestinationId: String(item.id) },
        })
      }
    >
      {/* Background image */}
      <Image
        source={{ uri: optimizeImage(item.images[0], { width: 800, quality: 80 }) }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />

      {/* Top vignette */}
      <LinearGradient
        colors={["rgba(0,0,0,0.48)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Bottom reveal */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.88)"]}
        start={{ x: 0, y: 0.48 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Top row ── */}
      <View style={styles.topRow}>
        <View style={styles.ratingPill}>
          <Ionicons name="star" size={12} color={C.secondary[500]} />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <TouchableOpacity
          onPress={() => toggleFavorite(item.id)}
          disabled={togglingFavorite}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.bookmarkBtn}
        >
          {togglingFavorite ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name={isFavorite ? "bookmark" : "bookmark-outline"}
              size={18}
              color={isFavorite ? C.secondary[400] : "#fff"}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* ── Bottom info ── */}
      <View style={styles.bottomBlock}>
        <View style={styles.tagRow}>
          {item.tags?.slice(0, 3).map((tag, i) => (
            <View key={i} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.nameText} numberOfLines={2}>{item.name}</Text>
        <View style={styles.footerRow}>
          <View style={styles.regionRow}>
            <Image source={GhanaFlag} style={styles.flag} contentFit="cover" />
            <Text style={styles.regionText}>{item.region}</Text>
          </View>
          <View style={[styles.exploreBtn, { backgroundColor: C.primary[500] }]}>
            <Ionicons name="arrow-forward" color="#fff" size={18} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { marginRight: 16, borderRadius: 20, alignSelf: "center", overflow: "hidden" },
  topRow: {
    position: "absolute", top: 16, left: 14, right: 14,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  ratingPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  ratingText: { color: "#fff", fontSize: 12, fontFamily: "PoppinsSemiBold" },
  bookmarkBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  bottomBlock: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 20 },
  tagRow: { flexDirection: "row", gap: 5, marginBottom: 8, flexWrap: "wrap" },
  tagPill: {
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  tagText: { color: "rgba(255,255,255,0.85)", fontSize: 10, fontFamily: "PoppinsRegular", textTransform: "capitalize" },
  nameText: { color: "#fff", fontSize: 32, fontFamily: "PoppinsBold", lineHeight: 38, marginBottom: 10, letterSpacing: -0.5 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  regionRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  flag: { width: 20, height: 20, borderRadius: 10 },
  regionText: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "PoppinsRegular" },
  exploreBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
});

export default React.memo(DestinationCard);
