import React from "react";
import { View, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { useTheme } from "@/context/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.3;

const FavouriteSkeleton = () => {
  const { top } = useSafeAreaInsets();
  const { colors: C } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.background,
        paddingTop: top,
        paddingHorizontal: H_PADDING,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingTop: 8,
          paddingBottom: 18,
        }}
      >
        <SkeletonBlock width={140} height={28} borderRadius={8} />
        <SkeletonBlock width={70} height={26} borderRadius={20} />
      </View>

      {/* 2-column grid */}
      {Array.from({ length: 3 }).map((_, row) => (
        <View
          key={row}
          style={{ flexDirection: "row", gap: CARD_GAP, marginBottom: CARD_GAP }}
        >
          <SkeletonBlock width={CARD_WIDTH} height={CARD_HEIGHT} borderRadius={18} />
          <SkeletonBlock width={CARD_WIDTH} height={CARD_HEIGHT} borderRadius={18} />
        </View>
      ))}
    </View>
  );
};

export default FavouriteSkeleton;
