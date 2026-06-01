import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { useTheme } from "@/context/ThemeContext";

const BookingCardSkeleton = ({ C }: { C: any }) => (
  <View
    style={{
      backgroundColor: C.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: C.primary[100],
      overflow: "hidden",
      marginBottom: 16,
    }}
  >
    {/* Image area */}
    <SkeletonBlock width="100%" height={180} borderRadius={0} />

    {/* Body */}
    <View style={{ padding: 14 }}>
      {/* Meta row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: C.primary[50],
          borderRadius: 12,
          borderWidth: 1,
          borderColor: C.primary[100],
          paddingHorizontal: 14,
          paddingVertical: 10,
          marginBottom: 12,
          gap: 10,
        }}
      >
        <SkeletonBlock width={26} height={26} borderRadius={7} />
        <SkeletonBlock width={100} height={14} borderRadius={6} />
        <View style={{ flex: 1 }} />
        <SkeletonBlock width={26} height={26} borderRadius={7} />
        <SkeletonBlock width={80} height={14} borderRadius={6} />
      </View>

      {/* Cancel button */}
      <SkeletonBlock width="100%" height={42} borderRadius={12} />
    </View>
  </View>
);

const TripsSkeleton = () => {
  const { top } = useSafeAreaInsets();
  const { colors: C } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.background,
        paddingTop: top,
        paddingHorizontal: 16,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingTop: 8,
          paddingBottom: 20,
        }}
      >
        <SkeletonBlock width={120} height={28} borderRadius={8} />
        <SkeletonBlock width={80} height={24} borderRadius={20} />
        <SkeletonBlock width={80} height={24} borderRadius={20} />
      </View>

      {/* Booking cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <BookingCardSkeleton key={i} C={C} />
      ))}
    </View>
  );
};

export default TripsSkeleton;
