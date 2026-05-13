import { Stack, useRouter } from "expo-router";
import "../global.css";
import { useFonts } from "expo-font";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import AuthProvider from "@/context/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useUser } from "@/hooks/user.hook";

import ExploreHeader from "@/components/Headers/ExploreHeader";
import { SearchProvider } from "@/context/SearchProvider";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/contants/colors";
import { DefaultStyles } from "@/contants/contants";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // ✅ 5 minutes
    },
  },
});

export default function RootLayout() {
  const [loaded] = useFonts({
    PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
    PoppinsSemiBold: require("../assets/fonts/Poppins-SemiBold.ttf"),
  });

  if (!loaded) return null;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SearchProvider>
            <InitialRootLayout />
          </SearchProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

const InitialRootLayout = () => {
  const { data: user } = useUser();
  const router = useRouter();
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false, animation: "fade" }}
      />
      <Stack.Screen
        name="(onboarding)/onboard"
        options={{ headerShown: false, animation: "fade" }}
      />
      <Stack.Screen
        name="(modals)/Explore"
        options={{
          presentation: "transparentModal",
          animation: "fade",
          headerTransparent: true,
          gestureEnabled: true,
          gestureDirection: "horizontal",
          header: () => <ExploreHeader user={user} />,
        }}
      />
      <Stack.Screen
        name="(modals)/[DestinationId]"
        options={{
          headerTitle: "",
          headerTransparent: false,
          headerBackTitle:''
        }}
      />
      <Stack.Screen
        name="(modals)/MapContainerView"
        options={{
          animation: "fade",
          headerTransparent: true,
          headerRight: () => (
            <TouchableOpacity className="w-10 h-10 bg-background rounded-full items-center justify-center"  style={[DefaultStyles.shadow]} onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={'black'} />
            </TouchableOpacity>
          ),
          headerTitle: "",
          headerLeft: () =><View/>,
          gestureEnabled: true,
          gestureDirection: "horizontal",
        }}
      />
    </Stack>
  );
};
