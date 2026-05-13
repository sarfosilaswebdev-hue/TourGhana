import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/contants/colors";
import { useRouter } from "expo-router";

const SearchBar = () => {
  const router = useRouter();
  return (
    <TouchableOpacity className="w-full pt-5" onPress={()=>router.push('/(modals)/Explore')}>
      <View className="  flex-row justify-between px-3">
        <Text className="font-popBold text-secondary-600 text-lg">Recommendations</Text>
        <Ionicons name="search" size={26} color={Colors.secondary[600]} />
      </View>
     <View className="w-full  bg-secondary mt-2" style={styles.divider}/>
    </TouchableOpacity>
  );
};



export default SearchBar;

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.secondary.DEFAULT,
  },
});
