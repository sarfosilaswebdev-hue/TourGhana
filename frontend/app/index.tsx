import Onboarding from "@/components/onboarding/Onboarding";
import { useAuth, useClerk } from "@clerk/expo";
import { router, useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function Index() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isSignedIn) {
      router.replace("/(onboarding)/onboard");
    }
  },[isSignedIn]);

  return <View className="flex-1 bg-background items-center justify-center" />;
}
