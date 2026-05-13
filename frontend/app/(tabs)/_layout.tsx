import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { Ionicons, MaterialIcons, Octicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { useUser } from "@/hooks/user.hook";

const _layout = () => {
  const {isSignedIn} = useAuth();
  const router = useRouter();
  
  useEffect(()=>{
    if(!isSignedIn){
      router.replace('/(onboarding)/onboard')
    }
  },[isSignedIn])
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#F2C94C',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0, elevation: 5 },
      tabBarBackground: () => <View className="bg-background absolute w-full h-full"/>
    }}>
      <Tabs.Screen
        name="Home"
        options={{ headerShown: false, title: "Explore",
            tabBarIcon: ({ color, size,focused }) => (
             <Ionicons name="search" size={size} color={color} />
            ),
         }}
      />
      <Tabs.Screen
        name="Trips/Trips"
        options={{ headerShown: false, title: "Trips",tabBarIcon: ({ color, size}) => (
          <MaterialIcons name="explore" size={size} color={color} />
        ), }}

      />
      <Tabs.Screen
        name="Favourite/Favourite"
        options={{
          headerShown: false,
          title: "Favourite",
          tabBarIcon: ({ color, size,focused }) => (
            <Ionicons name={!focused ? "heart-outline" : "heart"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile/Profile"
        options={{ headerShown: false, title: "Profile",tabBarIcon: ({ color, size ,focused}) => (
          <Ionicons name={!focused ? "person-outline" : "person" } size={size} color={color} />
        ), }}
      />
    </Tabs>
  );
};

export default _layout;
