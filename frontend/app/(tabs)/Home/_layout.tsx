import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import HomeHeader from "@/components/Headers/HomeHeader";
import { useUser } from "@/hooks/user.hook";

const _layout = () => {
  const { data: user, isLoading } = useUser();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: () => <HomeHeader user={user} isLoading={isLoading} />,
        }}
      />
    </Stack>
  );
};

export default _layout;
