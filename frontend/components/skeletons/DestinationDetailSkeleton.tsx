import React from "react";
import { ScrollView, View } from "react-native";
import { SkeletonBlock } from "@/components/ui/Skeleton";

const DestinationDetailSkeleton = () => {
  return (
    <View style={{ gap: 0 }}>
      {/* Rating pill row */}
      <View className="flex-row items-center mb-5">
        <SkeletonBlock width={160} height={32} borderRadius={20} />
      </View>

      {/* Tags row */}
      <View className="flex-row gap-2 mb-5">
        <SkeletonBlock width={72} height={30} borderRadius={20} />
        <SkeletonBlock width={88} height={30} borderRadius={20} />
        <SkeletonBlock width={64} height={30} borderRadius={20} />
      </View>

      {/* Divider */}
      <View className="h-px bg-gray-100 mb-5" />

      {/* About heading */}
      <View className="flex-row items-center gap-2 mb-3">
        <View className="w-1 h-5 bg-gray-200 rounded-full" />
        <SkeletonBlock width={60} height={18} borderRadius={6} />
      </View>

      {/* Text lines */}
      <View style={{ gap: 8, marginBottom: 20 }}>
        <SkeletonBlock width="100%" height={14} borderRadius={6} />
        <SkeletonBlock width="100%" height={14} borderRadius={6} />
        <SkeletonBlock width="92%" height={14} borderRadius={6} />
        <SkeletonBlock width="80%" height={14} borderRadius={6} />
      </View>

      {/* Chat card placeholder */}
      <SkeletonBlock width="100%" height={280} borderRadius={16} style={{ marginBottom: 20 }} />

      {/* Map placeholder */}
      <SkeletonBlock width="100%" height={400} borderRadius={12} style={{ marginBottom: 20 }} />

      {/* Gallery section */}
      <View className="mt-2">
        <View className="flex-row items-center gap-2 mb-3">
          <View className="w-1 h-5 bg-gray-200 rounded-full" />
          <SkeletonBlock width={60} height={18} borderRadius={6} />
        </View>
        <View className="flex-row gap-2">
          <SkeletonBlock width={148} height={100} borderRadius={12} />
          <SkeletonBlock width={148} height={100} borderRadius={12} />
          <SkeletonBlock width={148} height={100} borderRadius={12} />
        </View>
      </View>
    </View>
  );
};

export default DestinationDetailSkeleton;
