import { View, Text, Image } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@/Utils/types";
import SearchBar from "./SearchBar";
import { SkeletonBlock } from "@/components/ui/Skeleton";
import { useTheme } from "@/context/ThemeContext";

interface HomeHeaderProps {
  user: User | null | undefined;
  isLoading?: boolean;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  return "Good evening,";
}

const HomeHeader = ({ user, isLoading }: HomeHeaderProps) => {
  const { top } = useSafeAreaInsets();
  const { colors: C } = useTheme();

  return (
    <View style={{ paddingTop: top + 5, paddingBottom: 10, backgroundColor: C.background }} className="w-full items-center justify-between px-4">
      <View className="flex-row items-center w-full">
        {isLoading ? (
          <>
            <SkeletonBlock width={40} height={40} borderRadius={20} />
            <View style={{ marginLeft: 12, gap: 6 }}>
              <SkeletonBlock width={36} height={10} borderRadius={5} />
              <SkeletonBlock width={110} height={16} borderRadius={6} />
            </View>
          </>
        ) : (
          <>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} className="w-10 h-10 rounded-full" />
            ) : (
              <Ionicons name="person-circle-outline" size={40} color={C.muted} />
            )}
            <View className="ml-3">
              <Text className="text-sm" style={{ color: C.muted }}>{getGreeting()}</Text>
              <Text className="font-popSb text-xl" style={{ color: C.secondary[600] }}>
                {user?.firstName || "Explorer"}
              </Text>
            </View>
          </>
        )}
      </View>
      <SearchBar />
    </View>
  );
};

export default HomeHeader;