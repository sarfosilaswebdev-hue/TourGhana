import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React from "react";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/expo";
import { useGetUserBookings } from "@/hooks/bookings.hook";
import { useGetFavoriteDestinations } from "@/hooks/destination.hook";
import { useGetUserReviews } from "@/hooks/reviews.hook";
import { useTheme, ThemeMode } from "@/context/ThemeContext";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";

const menuItems = [
  { icon: "calendar-outline", label: "My Bookings", route: "/(tabs)/Trips/Trips" },
  { icon: "heart-outline", label: "Favourites", route: "/(tabs)/Favourite/Favourite" },
  { icon: "notifications-outline", label: "Notifications", route: null },
  { icon: "shield-checkmark-outline", label: "Privacy Policy", route: null },
  { icon: "help-circle-outline", label: "Help & Support", route: null },
];

const THEME_OPTIONS: { mode: ThemeMode; icon: string; label: string }[] = [
  { mode: "system", icon: "phone-portrait-outline", label: "System" },
  { mode: "light", icon: "sunny-outline", label: "Light" },
  { mode: "dark", icon: "moon-outline", label: "Dark" },
];

const ProfileScreen = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const { isDark, themeMode, setThemeMode, colors: C } = useTheme();

  const { data: bookingsData, isLoading: bookingsLoading } = useGetUserBookings();
  const { data: favouritesData, isLoading: favouritesLoading } = useGetFavoriteDestinations();
  const { data: reviewsData, isLoading: reviewsLoading } = useGetUserReviews();

  const bookingsCount = bookingsLoading ? null : (bookingsData?.data?.length ?? 0);
  const favouritesCount = favouritesLoading ? null : (favouritesData?.data?.length ?? 0);
  const reviewsCount = reviewsLoading ? null : (reviewsData?.data?.length ?? 0);

  const stats = [
    { label: "Bookings", icon: "calendar", value: bookingsCount, route: "/(tabs)/Trips/Trips" },
    { label: "Favourites", icon: "heart", value: favouritesCount, route: "/(tabs)/Favourite/Favourite" },
    { label: "Reviews", icon: "star", value: reviewsCount, route: "/(modals)/MyReviews" },
  ];

  if (!isLoaded) return <ProfileSkeleton />;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="bg-primary-500 pt-16 pb-10 px-6 items-center">
        <View className="relative mb-4">
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              style={{ width: 90, height: 90, borderRadius: 45 }}
              contentFit="cover"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-primary-300 items-center justify-center">
              <Text className="text-4xl font-popBold text-background">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </Text>
            </View>
          )}
          <View className="absolute bottom-0 right-0 bg-secondary-500 rounded-full p-1.5">
            <Ionicons name="pencil" size={12} color="#1C1C1C" />
          </View>
        </View>
        <Text className="text-2xl font-popBold text-background">
          {user?.firstName} {user?.lastName}
        </Text>
        <Text className="text-primary-200 font-regular text-sm mt-1">
          {user?.emailAddresses[0]?.emailAddress}
        </Text>
      </View>

      {/* Stats */}
      <View
        style={{ backgroundColor: C.surface, borderColor: C.primary[100] }}
        className="flex-row mx-6 -mt-5 rounded-2xl border overflow-hidden shadow-sm"
      >
        {stats.map(({ label, icon, value, route }, i) => (
          <TouchableOpacity
            key={label}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(route as any); }}
            style={i < 2 ? { borderRightWidth: 1, borderRightColor: C.primary[100] } : undefined}
            className="flex-1 items-center py-4"
          >
            <Ionicons name={icon as any} size={20} color={C.primary[500]} />
            <Text className="text-lg font-popBold text-dark mt-1">
              {value === null ? "—" : value}
            </Text>
            <Text className="text-xs text-muted font-regular">{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Info card */}
      <View
        style={{ backgroundColor: C.surface, borderColor: C.primary[100] }}
        className="mx-6 mt-6 rounded-2xl border overflow-hidden"
      >
        <Text className="text-xs font-popSb text-muted px-4 pt-4 pb-2 uppercase tracking-widest">
          Account Info
        </Text>
        {[
          { icon: "person-outline", label: "Full Name", value: `${user?.firstName} ${user?.lastName}` },
          { icon: "mail-outline", label: "Email", value: user?.emailAddresses[0]?.emailAddress },
          { icon: "phone-portrait-outline", label: "Phone", value: user?.phoneNumbers?.[0]?.phoneNumber ?? "Not set" },
        ].map(({ icon, label, value }, i, arr) => (
          <View
            key={label}
            style={i < arr.length - 1 ? { borderBottomWidth: 1, borderBottomColor: C.primary[50] } : undefined}
            className="flex-row items-center px-4 py-4"
          >
            <View style={{ backgroundColor: C.primary[50] }} className="rounded-full p-2 mr-3">
              <Ionicons name={icon as any} size={16} color={C.primary[500]} />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-muted font-regular">{label}</Text>
              <Text className="text-sm font-popSb text-dark mt-0.5">{value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Appearance */}
      <View
        style={{ backgroundColor: C.surface, borderColor: C.primary[100] }}
        className="mx-6 mt-6 rounded-2xl border overflow-hidden"
      >
        <Text className="text-xs font-popSb text-muted px-4 pt-4 pb-3 uppercase tracking-widest">
          Appearance
        </Text>
        <View className="flex-row px-4 pb-4 gap-2">
          {THEME_OPTIONS.map(({ mode, icon, label }) => {
            const isActive = themeMode === mode;
            return (
              <TouchableOpacity
                key={mode}
                onPress={() => { Haptics.selectionAsync(); setThemeMode(mode); }}
                activeOpacity={0.75}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 12,
                  borderRadius: 14,
                  gap: 5,
                  backgroundColor: isActive ? C.primary[500] : C.primary[50],
                  borderWidth: 1,
                  borderColor: isActive ? C.primary[600] : C.primary[100],
                }}
              >
                <Ionicons
                  name={icon as any}
                  size={18}
                  color={isActive ? "#fff" : C.primary[500]}
                />
                <Text
                  style={{
                    fontFamily: "PoppinsSemiBold",
                    fontSize: 11,
                    color: isActive ? "#fff" : C.primary[600],
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Menu */}
      <View
        style={{ backgroundColor: C.surface, borderColor: C.primary[100] }}
        className="mx-6 mt-6 rounded-2xl border overflow-hidden"
      >
        <Text className="text-xs font-popSb text-muted px-4 pt-4 pb-2 uppercase tracking-widest">
          Menu
        </Text>
        {menuItems.map(({ icon, label, route }, i) => (
          <TouchableOpacity
            key={label}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); route && router.push(route as any); }}
            style={i < menuItems.length - 1 ? { borderBottomWidth: 1, borderBottomColor: C.primary[50] } : undefined}
            className="flex-row items-center px-4 py-4"
          >
            <View style={{ backgroundColor: C.primary[50] }} className="rounded-full p-2 mr-3">
              <Ionicons name={icon as any} size={16} color={C.primary[500]} />
            </View>
            <Text className="flex-1 text-sm font-popSb text-dark">{label}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign out */}
      <TouchableOpacity
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); signOut(); }}
        style={{
          backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "#FEF2F2",
          borderColor: isDark ? "rgba(239,68,68,0.2)" : "#FEE2E2",
        }}
        className="mx-6 mt-6 flex-row items-center justify-center border rounded-2xl py-4 gap-2"
      >
        <Ionicons name="log-out-outline" size={20} color={C.error} />
        <Text style={{ color: C.error }} className="font-popSb">Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;
