import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import React, { useRef, useState } from "react";
import { useUser } from "@/hooks/user.hook";
import { SafeAreaView } from "react-native-safe-area-context";
import { categories } from "@/contants/contants";
import { Category, Destination } from "@/Utils/types";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { useGetAllDestinations } from "@/hooks/destination.hook";
import DestinationCard from "@/components/Home/DestinationCard";

type CategoryFilter = "All" | Category;

const index = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [viewHeight, setViewHeight] = useState<number>(0);
  const viewRef = useRef<View | null>(null);
  const [isAbove, setIsAbove] = useState<boolean>(true);

  const { data } = useGetAllDestinations({
    category: activeCategory,
  });
  const destinations = data?.destinations || [];

  const handleSelectCategory = (cat: CategoryFilter, event: any) => {
    const { pageY } = event.nativeEvent;

    console.log("Clicked Y:", pageY);
    console.log("Container height:", viewHeight);

    if (pageY > viewHeight/2) {
      setIsAbove(false);
    }else{
       setIsAbove(true);
    }

    setActiveCategory(cat);
  };

  const renderItem = ({ item }: { item: Destination }) => (
    <Animated.View entering={isAbove ? FadeInUp : FadeInDown}>
      <DestinationCard item={item} />
    </Animated.View>
  );
  return (
    <View
      className="flex-1 bg-background flex-row"
      onLayout={(e) => setViewHeight(e.nativeEvent.layout.height)}
    >
      <View className=" justify-between py-10 items-center">
        {categories.map((cat, index) => (
          <TouchableOpacity
            className="-rotate-90 items-center"
            onPress={(e) => handleSelectCategory(cat, e)}
            key={cat}
          >
            <Text
              className={`font-popSb ${activeCategory === cat && "text-secondary-600"}`}
            >
              {cat}
            </Text>
            {activeCategory === cat && (
              <Animated.View
                entering={FadeIn.delay(100)}
                className="w-5 h-1 bg-secondary-600 rounded-full"
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={destinations as Destination[]}
        horizontal
        className="flex-1"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item.id}
        renderItem={renderItem}
        initialNumToRender={5}
        contentContainerStyle={{
          paddingHorizontal: 5,
          paddingVertical: 5,
          alignItems: "center",
        }}
      />
    </View>
  );
};

export default index;
