import React from "react";
import { View, ScrollView, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { useTheme } from "@/context/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const STAT_WIDTH = (SCREEN_WIDTH - 48) / 3;

const ProfileSkeleton = () => {
  const { colors: C, isDark } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: C.primary[500],
          paddingTop: 64,
          paddingBottom: 40,
          paddingHorizontal: 24,
          alignItems: "center",
          gap: 12,
        }}
      >
        <SkeletonBlock width={90} height={90} borderRadius={45} />
        <SkeletonBlock width={140} height={20} borderRadius={8} />
        <SkeletonBlock width={180} height={14} borderRadius={6} />
      </View>

      {/* Stats card */}
      <View
        style={{
          backgroundColor: C.surface,
          borderWidth: 1,
          borderColor: C.primary[100],
          borderRadius: 16,
          marginHorizontal: 24,
          marginTop: -20,
          flexDirection: "row",
          overflow: "hidden",
        }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <View
            key={i}
            style={{
              width: STAT_WIDTH,
              alignItems: "center",
              paddingVertical: 16,
              gap: 6,
              borderRightWidth: i < 2 ? 1 : 0,
              borderRightColor: C.primary[100],
            }}
          >
            <SkeletonBlock width={22} height={22} borderRadius={11} />
            <SkeletonBlock width={30} height={20} borderRadius={6} />
            <SkeletonBlock width={50} height={12} borderRadius={4} />
          </View>
        ))}
      </View>

      {/* Account info section */}
      <View
        style={{
          backgroundColor: C.surface,
          borderWidth: 1,
          borderColor: C.primary[100],
          borderRadius: 16,
          marginHorizontal: 24,
          marginTop: 24,
          overflow: "hidden",
        }}
      >
        <SkeletonBlock width={80} height={12} borderRadius={4} style={{ margin: 16, marginBottom: 8 }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderTopWidth: i > 0 ? 1 : 0,
              borderTopColor: C.primary[50],
              gap: 12,
            }}
          >
            <SkeletonBlock width={36} height={36} borderRadius={18} />
            <View style={{ gap: 6 }}>
              <SkeletonBlock width={60} height={10} borderRadius={4} />
              <SkeletonBlock width={140} height={14} borderRadius={4} />
            </View>
          </View>
        ))}
      </View>

      {/* Appearance section */}
      <View
        style={{
          backgroundColor: C.surface,
          borderWidth: 1,
          borderColor: C.primary[100],
          borderRadius: 16,
          marginHorizontal: 24,
          marginTop: 24,
          overflow: "hidden",
        }}
      >
        <SkeletonBlock width={90} height={12} borderRadius={4} style={{ margin: 16, marginBottom: 8 }} />
        <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} width={(SCREEN_WIDTH - 80) / 3} height={60} borderRadius={14} />
          ))}
        </View>
      </View>

      {/* Menu section */}
      <View
        style={{
          backgroundColor: C.surface,
          borderWidth: 1,
          borderColor: C.primary[100],
          borderRadius: 16,
          marginHorizontal: 24,
          marginTop: 24,
          overflow: "hidden",
        }}
      >
        <SkeletonBlock width={50} height={12} borderRadius={4} style={{ margin: 16, marginBottom: 8 }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderTopWidth: i > 0 ? 1 : 0,
              borderTopColor: C.primary[50],
              gap: 12,
            }}
          >
            <SkeletonBlock width={36} height={36} borderRadius={18} />
            <SkeletonBlock width={120} height={14} borderRadius={4} />
          </View>
        ))}
      </View>

      {/* Sign out button skeleton */}
      <SkeletonBlock
        width={SCREEN_WIDTH - 48}
        height={52}
        borderRadius={16}
        style={{ marginHorizontal: 24, marginTop: 24 }}
      />
    </ScrollView>
  );
};

export default ProfileSkeleton;
