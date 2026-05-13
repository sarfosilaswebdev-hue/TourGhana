import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Destination } from "@/Utils/types";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/contants/colors";
import GhanaFlag from "@/assets/images/ghanaFlag.png";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { optimizeImage } from "@/Utils/optimizeImage";

const width = Dimensions.get("window").width;

const DestinationCard = ({
  item,
  widthIncrement = 0,
  height,
}: {
  item: Destination;
  widthIncrement?: number;
  height?: number;
}) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={{
        width: width * 0.72 + widthIncrement,
        marginRight: 16,
        height: height || "100%",
        position: "relative",
        borderRadius: 12,
        alignSelf:"center"
      }}
      className="overflow-hidden bg-red-500"
      onPress={() =>
        router.push({
          pathname: "/(modals)/[DestinationId]",
          params: { DestinationId: String(item.id) },
        })
      }
    >
      <Image
        source={{
          uri: optimizeImage(item.images[0], { width: 800, quality: 80 }),
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      {/* Overlay */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 12,
          backgroundColor: "rgba(0,0,0,0.4)",
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          justifyContent: "space-between",
        }}
        className="h-full"
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <Ionicons name="star" size={20} color={Colors.secondary[600]} />
            <Text className="text-secondary-600">{item.rating}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="bookmark" size={30} color={Colors.background} />
          </TouchableOpacity>
        </View>
        <View>
          <View className="flex-row gap-1">
            {item.tags?.slice(0, 3).map((tag, index) => (
              <Text
                key={index}
                className="text-background/60 capitalize px-1 font-regular"
              >
                {tag}
              </Text>
            ))}
          </View>
          <Text className="text-4xl font-popBold text-background">
            {item.name}
          </Text>
          <View
            className="flex-row gap-2s items-center"
            style={{ marginBottom: 4 }}
          >
            <Image
              source={GhanaFlag}
              className="w-10 h-10 rounded-full"
              resizeMode="contain"
            />
            <Text className="text-background/60 text-sm font-regular">
              {item.region}
            </Text>
          </View>
          <TouchableOpacity
            style={{ alignSelf: "flex-end" }}
            className="bg-primary-500/60 w-24 h-16 rounded-xl border-primary-600 border-2  items-center justify-center"
          >
            <Ionicons
              name="arrow-forward"
              color={Colors.background}
              size={30}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(DestinationCard);
