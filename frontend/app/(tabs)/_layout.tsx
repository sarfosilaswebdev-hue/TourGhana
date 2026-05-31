import { View } from "react-native";
import React, { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { useUser } from "@/hooks/user.hook";
import { useTheme } from "@/context/ThemeContext";

const _layout = () => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { isDark, colors: C } = useTheme();

  useEffect(() => {
    if (!isSignedIn) {
      router.replace("/(onboarding)/onboard");
    }
  }, [isSignedIn]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#F2C94C",
        tabBarInactiveTintColor: isDark ? "#4D6B62" : "gray",
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopWidth: 1,
          borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          elevation: 8,
        },
        tabBarBackground: () => (
          <View style={{ backgroundColor: C.surface, flex: 1 }} />
        ),
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          headerShown: false,
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Trips/Trips"
        options={{
          headerShown: false,
          title: "Trips",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="explore" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Favourite/Favourite"
        options={{
          headerShown: false,
          title: "Favourite",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={!focused ? "heart-outline" : "heart"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile/Profile"
        options={{
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={!focused ? "person-outline" : "person"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
