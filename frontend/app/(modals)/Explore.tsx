import DestinationCard from "@/components/Home/DestinationCard";
import { Colors } from "@/contants/colors";
import { ALL_TAGS, categories, DefaultStyles } from "@/contants/contants";
import { useSearch } from "@/context/SearchProvider";
import { useGetAllDestinations } from "@/hooks/destination.hook";
import { Destination } from "@/Utils/types";
import { useHeaderHeight } from "@react-navigation/elements";
import { BlurView } from "expo-blur";
import {
  Text,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

export default function App() {
  const { data } = useGetAllDestinations({ category: "All", limit: 10 });
  const destinations: Destination[] = data?.destinations || [];
  const { searchResult, isFetching,setSearch } = useSearch();
  const headerHeight = useHeaderHeight();



  const renderItem = ({ item }: { item: Destination }) => (
    <DestinationCard item={item} widthIncrement={80} height={250} />
  );

  return (
    <BlurView
      intensity={80}
      tint="light"
      experimentalBlurMethod="dimezisBlurView"
      className="flex-1 items-center"
      style={{ paddingTop: headerHeight }}
    >
      <View className="gap-2 items-center w-full">
        {searchResult.length !== 0 ? (
          <View className="items-center">
             <FlatList
              data={searchResult}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              initialNumToRender={5}
              contentContainerStyle={{
                paddingHorizontal: 5,
                paddingVertical: 5,
                alignItems: "center",
                gap:10,
                paddingBottom:120
              }}
            />
          </View>
        ) : isFetching ? (
          <View className="items-center justify-center h-[250px]">
            <ActivityIndicator size={40} color={Colors.secondary[700]}/>
          </View>
        ) : (
          <>
            <FlatList
              data={destinations}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              initialNumToRender={5}
              contentContainerStyle={{
                paddingHorizontal: 5,
                paddingVertical: 5,
                alignItems: "center",
              }}
            />
            <View className="flex-row gap-2 flex-wrap px-2 items-center ">
              {ALL_TAGS.slice(1, 6).map((category, index) => (
                <TouchableOpacity
                  key={index}
                  className="px-3 py-2 bg-background rounded-xl"
                  style={DefaultStyles.shadow}
                  onPress={()=>setSearch(category)}
                >
                  <Text className="font-regular">{category.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blurContainer: {
    flex: 1,
    padding: 20,
    margin: 16,
    textAlign: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 20,
  },
  background: {
    flex: 1,
    flexWrap: "wrap",
    // StyleSheet.absoluteFill,
  },
  box: {
    width: "25%",
    height: "20%",
  },
  boxEven: {
    backgroundColor: "orangered",
  },
  boxOdd: {
    backgroundColor: "gold",
  },
  text: {
    fontSize: 24,
    fontWeight: "600",
  },
});
