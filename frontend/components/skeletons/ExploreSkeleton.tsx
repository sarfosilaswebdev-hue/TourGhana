import React from "react";
import { View, Dimensions, ScrollView } from "react-native";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { useTheme } from "@/context/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.72 + 80;
const H_CARD_WIDTH = SCREEN_WIDTH * 0.55;

const ExploreSkeleton = () => {
  return (
    <View style={{ alignItems: "center", gap: 10 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonBlock key={i} width={CARD_WIDTH} height={250} borderRadius={20} />
      ))}
    </View>
  );
};

export const PrefetchedExploreSkeleton = () => {
  return (
    <View style={{ width: "100%", gap: 16 }}>
      {/* Horizontal cards row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={{ paddingHorizontal: 5, gap: 10, alignItems: "center" }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} width={H_CARD_WIDTH} height={250} borderRadius={20} />
        ))}
      </ScrollView>

      {/* Category tag pills */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 8 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} width={70 + (i % 3) * 15} height={36} borderRadius={12} />
        ))}
      </View>
    </View>
  );
};

export default ExploreSkeleton;
