import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/contants/colors";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { User } from "@/Utils/types";
import { useSearch } from "@/context/SearchProvider";

type ExploreHeaderProps = {
  user: User | null;
};

const ExploreHeader = ({ user }: ExploreHeaderProps) => {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { setSearch,search} = useSearch();



  const [input, setInput] = useState("");
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(input);
    }, 300);

    return () => clearTimeout(timeout);
  }, [input]);
  return (
    <View
      style={{ paddingTop: top + 5 }}
      className="bg-background w-full items-center justify-between px-4"
    >
      <View className="flex-row px-4 items-center">
        <View className="items-center align-left w-full flex-row">
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
        <TouchableOpacity
          className="w-10 h-10 bg-background items-center justify-center rounded-full"
          style={{
            elevation: 4, // Android shadow
            shadowColor: "#000", // iOS shadow
            shadowOpacity: 0.2,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          }}
          onPress={() => router.back()}
        >
          <Ionicons
            name="close-outline"
            size={28}
            color={Colors.secondary[600]}
          />
        </TouchableOpacity>
      </View>
      <View className="w-full pt-1">
        <View className=" flex-row justify-between px-3">
          <TextInput
            className="font-popBold text-secondary-600 text-lg  px-2 flex-1"
            placeholder={search || "Recommendations"}
            placeholderTextColor={Colors.secondary[600]}
            onChangeText={setInput}
          />
          <TouchableOpacity className="w-16 h-16 bg-secondary-600 rounded-xl items-center justify-center m-1">
            <Ionicons name="search" size={26} color={Colors.background} />
          </TouchableOpacity>
        </View>
        <View
          className={`w-ful bg-secondary ${Platform.OS == "ios" && "mt-1"}`}
          style={styles.divider}
        />
      </View>
    </View>
  );
};

export default ExploreHeader;
const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.secondary.DEFAULT,
  },
});
