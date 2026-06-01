import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StyleSheet,
} from "react-native";
import React, { useMemo, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { useUser } from "@/hooks/user.hook";
import { Category, Destination } from "@/Utils/types";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { useGetAllDestinations, useGetFavoriteDestinations } from "@/hooks/destination.hook";
import DestinationCard from "@/components/Home/DestinationCard";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, AppColors } from "@/context/ThemeContext";
import HomeSkeleton, { HomeCardsSkeleton } from "@/components/skeletons/HomeSkeleton";

type CategoryFilter = "All" | Category;

let homeInitialLoadDone = false;

const STEP = 6;
const { width } = Dimensions.get("window");

const CATEGORY_META: {
  label: CategoryFilter;
  icon: keyof typeof Ionicons.glyphMap;
  short: string;
}[] = [
  { label: "All",               icon: "grid",   short: "All"     },
  { label: Category.NATURE,     icon: "leaf",   short: "Nature"  },
  { label: Category.CULTURAL,   icon: "people", short: "Culture" },
  { label: Category.HISTORICAL, icon: "time",   short: "History" },
  { label: Category.ADVENTURE,  icon: "flash",  short: "Adventure"},
  { label: Category.BEACH,      icon: "water",  short: "Beach"   },
];

const index = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [viewHeight, setViewHeight] = useState<number>(0);
  const viewRef = useRef<View | null>(null);
  const [isAbove, setIsAbove] = useState<boolean>(true);
  const [limit, setLimit] = useState(STEP);

  const { isDark, colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C, isDark), [isDark]);

  const { data, isFetching, isLoading } = useGetAllDestinations({ category: activeCategory, limit });
  const destinations = data?.destinations || [];
  const hasMore = destinations.length >= limit;

  const { data: favorite } = useGetFavoriteDestinations();
  const isFavorited = (destinationId: string) =>
    favorite?.data?.some((dest: Destination) => dest.id === destinationId) ?? false;

  if (!isLoading) homeInitialLoadDone = true;
  if (isLoading && !homeInitialLoadDone) return <HomeSkeleton />;

  const handleSelectCategory = (cat: CategoryFilter, event: any) => {
    const { pageY } = event.nativeEvent;
    Haptics.selectionAsync();
    setIsAbove(pageY <= viewHeight / 2);
    setLimit(STEP);
    setActiveCategory(cat);
  };

  const renderItem = ({ item }: { item: Destination }) => (
    <Animated.View entering={isAbove ? FadeInUp : FadeInDown}>
      <DestinationCard item={item} isFavorited={isFavorited} />
    </Animated.View>
  );

  return (
    <View
      style={styles.root}
      onLayout={(e) => setViewHeight(e.nativeEvent.layout.height)}
    >
      {/* ── Category sidebar ── */}
      <View style={styles.sidebar}>
        {CATEGORY_META.map(({ label, icon, short }, i) => {
          const isActive = activeCategory === label;
          return (
            <Animated.View key={label} entering={FadeIn.delay(i * 60)}>
              <TouchableOpacity
                onPress={(e) => handleSelectCategory(label, e)}
                activeOpacity={0.7}
                style={styles.catBtn}
              >
                <View style={[styles.catIconWrap, isActive && styles.catIconWrapActive]}>
                  <Ionicons
                    name={isActive ? icon : (`${icon}-outline` as any)}
                    size={20}
                    color={isActive ? "#fff" : C.muted}
                  />
                </View>
                <Text
                  style={[styles.catLabel, isActive && styles.catLabelActive]}
                  numberOfLines={1}
                >
                  {short}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* ── Cards area ── */}
      <View style={{ flex: 1, paddingTop: 5 }}>
        {isFetching ? (
          <HomeCardsSkeleton />
        ) : (
          <>
            {/* Destination count */}
            <View style={{ paddingBottom: 8, paddingHorizontal: 4 }}>
              <View style={styles.countPill}>
                <Ionicons name="location" size={13} color={C.primary[500]} />
                <Text style={styles.countText}>
                  {destinations.length} spot{destinations.length !== 1 ? "s" : ""}
                </Text>
              </View>
            </View>

            <FlatList
              data={destinations as Destination[]}
              horizontal
              style={{ flex: 1 }}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              initialNumToRender={5}
              ListFooterComponent={
                hasMore ? (
                  <TouchableOpacity
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLimit((prev) => prev + STEP); }}
                    style={styles.loadMoreCard}
                    activeOpacity={0.7}
                  >
                    <View style={styles.loadMoreIcon}>
                      <Ionicons name="arrow-forward" size={22} color={C.primary[500]} />
                    </View>
                    <Text style={styles.loadMoreText}>Load more</Text>
                  </TouchableOpacity>
                ) : null
              }
              contentContainerStyle={{
                paddingHorizontal: 5,
                paddingVertical: 5,
                alignItems: "center",
              }}
            />
          </>
        )}
      </View>
    </View>
  );
};

const createStyles = (C: AppColors, isDark: boolean) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: C.background,
      flexDirection: "row",
    },
    sidebar: {
      width: 62,
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 40,
    },
    catBtn: { alignItems: "center", gap: 5 },
    catIconWrap: {
      width: 42, height: 42, borderRadius: 13,
      alignItems: "center", justifyContent: "center",
      backgroundColor: "transparent",
    },
    catIconWrapActive: { backgroundColor: C.primary[500] },
    catLabel: {
      fontSize: 9, fontFamily: "PoppinsSemiBold",
      color: C.muted, textAlign: "center", width: 54,
    },
    catLabelActive: { color: C.primary[600] },

    countPill: {
      flexDirection: "row", alignItems: "center", gap: 5,
      alignSelf: "flex-end",
      backgroundColor: C.primary[50], borderRadius: 20,
      paddingHorizontal: 12, paddingVertical: 6,
      borderWidth: 1, borderColor: C.primary[100],
    },
    countText: { fontFamily: "PoppinsSemiBold", fontSize: 12, color: C.primary[600] },

    loadMoreCard: {
      width: width * 0.35, height: "100%", marginRight: 8,
      borderRadius: 12, alignSelf: "center",
      alignItems: "center", justifyContent: "center", gap: 10,
      borderWidth: 2, borderColor: C.primary[100],
      borderStyle: "dashed",
    },
    loadMoreIcon: {
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: C.primary[50], alignItems: "center", justifyContent: "center",
    },
    loadMoreText: { fontFamily: "PoppinsSemiBold", fontSize: 13, color: C.primary[600] },
  });

export default index;
