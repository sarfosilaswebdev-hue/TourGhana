import React from "react";
import { View, Dimensions, ScrollView } from "react-native";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { useTheme } from "@/context/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.72;

const HomeSkeleton = () => {
  const { colors: C } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        backgroundColor: C.background,
      }}
    >
      {/* Sidebar */}
      <View
        style={{
          width: 62,
          paddingVertical: 40,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={{ alignItems: "center", gap: 6 }}>
            <SkeletonBlock width={42} height={42} borderRadius={13} />
            <SkeletonBlock width={36} height={8} borderRadius={4} />
          </View>
        ))}
      </View>

      {/* Cards area */}
      <View style={{ flex: 1, paddingTop: 5 }}>
        {/* Count pill */}
        <View style={{ paddingBottom: 8, paddingHorizontal: 4, alignItems: "flex-end" }}>
          <SkeletonBlock width={80} height={28} borderRadius={20} />
        </View>

        {/* Horizontal cards */}
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 5,
            gap: 16,
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock
              key={i}
              width={CARD_WIDTH}
              height="100%"
              borderRadius={20}
              style={{ marginRight: i < 2 ? 0 : 0 }}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export const HomeCardsSkeleton = () => {
  return (
    <View style={{ flex: 1 }}>
      {/* Count pill */}
      <View style={{ paddingBottom: 8, paddingHorizontal: 4, alignItems: "flex-end" }}>
        <SkeletonBlock width={80} height={28} borderRadius={20} />
      </View>

      {/* Horizontal skeleton cards */}
      <ScrollView
        horizontal
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 5,
          paddingVertical: 5,
          alignItems: "center",
          gap: 16,
        }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} width={CARD_WIDTH} height="90%" borderRadius={20} />
        ))}
      </ScrollView>
    </View>
  );
};

export default HomeSkeleton;
