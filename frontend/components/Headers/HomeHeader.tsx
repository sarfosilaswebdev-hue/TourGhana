import { View, Text, Image } from "react-native";
import React from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@/Utils/types";
import SearchBar from "./SearchBar";

interface HomeHeaderProps {
  user: User | null;
}

const HomeHeader = ({ user }: HomeHeaderProps) => {
  const {top} = useSafeAreaInsets();
  return (
    <View style={{paddingTop:top + 5, paddingBottom:10}} className="bg-background w-full items-center justify-between px-4">
      <View className="flex-row items-center align-left w-full">
        {user?.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <Ionicons name="person-circle-outline" size={40} color="black" />
        )}

        <View className="ml-3">
          <Text className="text-sm text-gray-500">hello</Text>
          <Text className="font-popSb text-xl text-secondary-600">
            {user?.firstName || "User"}
          </Text>
        </View>
      </View>
      <SearchBar/>
    </View>
  );
};

export default HomeHeader;