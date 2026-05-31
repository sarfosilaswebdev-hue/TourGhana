import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useRef, useState } from "react";
import { onboardingContent } from "@/contants/onboardingContent";
import SlideContent from "./SlideContent";
import Pagination from "./Pagination";
import Animated, { useAnimatedScrollHandler } from "react-native-reanimated";
import { runOnJS } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useAuthSocial } from "@/hooks/useSocialAuth";
import useWarmUpBrowser from "@/hooks/useWarmUpBrowser";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const { width } = Dimensions.get("window");

const Onboarding = () => {
  const scrollRef = useRef<Animated.ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { handleSocialAuth, loadingStrategy } = useAuthSocial();
  const { bottom: safeBottom, top: safeTop } = useSafeAreaInsets();
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
        x: (activeIndex + 1) * width,
        animated: true,
      });
    }
  };

  const handleSkip = () => {
    scrollRef.current?.scrollTo({
      x: (onboardingContent.length - 1) * width,
      animated: true,
    });
  };

  const isLast = activeIndex === onboardingContent.length - 1;
  const isSecondToLast = activeIndex === onboardingContent.length - 2;

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent />



      {/* Full-screen horizontal pager */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={StyleSheet.absoluteFillObject}
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

      {/* Fixed bottom action panel */}
      <View
        style={[
          styles.bottomPanel,
          { paddingBottom: safeBottom + 20 },
        ]}
        pointerEvents="box-none"
      >
        {/* Gradient fade from transparent into panel */}
        <LinearGradient
          colors={["transparent", "rgba(8,28,20,0.96)", "rgba(8,28,20,1)"]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        <Pagination activeIndex={activeIndex} />

        <View style={styles.buttonsArea}>
          {isLast ? (
            <>
              {/* Google */}
              <TouchableOpacity
                style={[styles.goldButton, !!loadingStrategy && styles.dimmed]}
                onPress={() => handleSocialAuth("oauth_google")}
                disabled={!!loadingStrategy}
                activeOpacity={0.82}
              >
                {loadingStrategy === "oauth_google" ? (
                  <ActivityIndicator size={20} color="#081C14" />
                ) : (
                  <View style={styles.buttonRow}>
                    <Ionicons name="logo-google" size={18} color="#081C14" />
                    <Text style={styles.goldButtonText}>
                      Continue with Google
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Apple — iOS only */}
              {Platform.OS === "ios" && (
                <TouchableOpacity
                  style={[
                    styles.ghostButton,
                    !!loadingStrategy && styles.dimmed,
                  ]}
                  onPress={() => handleSocialAuth("oauth_apple")}
                  disabled={!!loadingStrategy}
                  activeOpacity={0.82}
                >
                  {loadingStrategy === "oauth_apple" ? (
                    <ActivityIndicator size={20} color="#fff" />
                  ) : (
                    <View style={styles.buttonRow}>
                      <Ionicons name="logo-apple" size={18} color="#fff" />
                      <Text style={styles.ghostButtonText}>
                        Continue with Apple
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.goldButton}
                onPress={handleNext}
                activeOpacity={0.82}
              >
                <Text style={styles.goldButtonText}>
                  {isSecondToLast ? "Get Started" : "Next"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.6}
              >
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#081C14",
  },
  logoContainer: {
    position: "absolute",
    left: 20,
    zIndex: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  logo: {
    width: 110,
    height: 44,
  },
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 52,
    paddingHorizontal: 24,
  },
  buttonsArea: {
    marginTop: 22,
    gap: 12,
  },
  goldButton: {
    backgroundColor: "#F2C94C",
    borderRadius: 100,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 100,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  dimmed: {
    opacity: 0.5,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  goldButtonText: {
    fontFamily: "PoppinsBold",
    fontSize: 16,
    color: "#081C14",
    letterSpacing: 0.2,
  },
  ghostButtonText: {
    fontFamily: "PoppinsBold",
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  skipText: {
    fontFamily: "PoppinsRegular",
    fontSize: 14,
    color: "rgba(255,255,255,0.38)",
    letterSpacing: 0.3,
  },
});
