import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useRef, useState } from "react";
import { onboardingContent } from "@/contants/onboardingContent";
import SlideContent from "./SlideContent";
import Pagination from "./Pagination";
import Button from "../ui/Button";
import Animated, { useAnimatedScrollHandler } from "react-native-reanimated";
import { runOnJS } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthSocial } from "@/hooks/useSocialAuth";
import useWarmUpBrowser from "@/hooks/useWarmUpBrowser";

const WIDTH = Dimensions.get("window").width;

const Onboarding = () => {
  const scrollRef = useRef<Animated.ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const { handleSocialAuth, loadingStrategy } = useAuthSocial();
  useWarmUpBrowser();
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const index = Math.round(
        event.contentOffset.x / event.layoutMeasurement.width,
      );
      runOnJS(setActiveIndex)(index);
    },
  });

  const handleNext = () => {
    if (activeIndex < onboardingContent.length - 1) {
      scrollRef.current?.scrollTo({
        x: (activeIndex + 1) * WIDTH,
        animated: true,
      });
    }
  };

  const handleSkip = () => {
    console.log("Skip for now pressed");
    scrollRef.current?.scrollTo({
      x: (onboardingContent.length - 1) * WIDTH,
      animated: true,
    });
  };

  return (
    <View className="w-full items-center justify-center bg-background">
      <Animated.ScrollView
        className="mb-10"
        horizontal
        ref={scrollRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "center" }}
      >
        {onboardingContent.map((item, index) => (
          <SlideContent
            key={index}
            title={item.title}
            description={item.description}
            image={item.image}
          />
        ))}
      </Animated.ScrollView>
      <View className="w-full min-h-[180px] items-center mt-[20px]">
        {activeIndex === onboardingContent.length - 1 ? (
          <>
            <Pagination activeIndex={activeIndex} />
            <View className="w-full items-center mt-6">
              <Button
                className="w-[90%] flex-row justify-center"
                onPress={() => handleSocialAuth("oauth_google")}
                disabled={loadingStrategy === "oauth_google"}
              >
                {loadingStrategy === "oauth_google" ? (
                  <ActivityIndicator size={24} color={"#F2C94C"} />
                ) : (
                  <>
                    <Text className="text-white font-popBold text-lg">
                      Google
                    </Text>
                    <Ionicons
                      name="logo-google"
                      size={20}
                      color="#fff"
                      className="ml-2"
                    />
                  </>
                )}
              </Button>
              {Platform.OS === "ios" && (
                <Button
                  className="w-[90%] flex-row justify-center mt-4"
                  onPress={() => handleSocialAuth("oauth_apple")}
                  disabled={loadingStrategy === "oauth_apple"}
                >
                  {loadingStrategy === "oauth_apple" ? (
                    <ActivityIndicator size={24} color={"#F2C94C"} />
                  ) : (
                    <>
                      <Text className="text-white font-popBold text-lg">
                        Apple
                      </Text>
                      <Ionicons
                        name="logo-apple"
                        size={20}
                        color="#fff"
                        className="ml-2"
                      />
                    </>
                  )}
                </Button>
              )}
            </View>
          </>
        ) : (
          <>
            <Pagination activeIndex={activeIndex} />
            <View className="mt-4 w-full items-center">
              <Button className="w-[90%]" onPress={handleNext}>
                <Text className="text-white font-popBold text-lg">
                  {activeIndex === onboardingContent.length - 1
                    ? "Get Started"
                    : "Next"}
                </Text>
              </Button>
            </View>

            <TouchableOpacity className="mt-4" onPress={handleSkip}>
              <Text className="text-gray-400 font-popSb text-sm">
                Skip for now
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default Onboarding;

const styles = StyleSheet.create({});
