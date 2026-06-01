import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

// Constrained image area — no overflow
const IMAGE_HEIGHT = height * 0.52;

const EASING = Easing.out(Easing.cubic);

interface SlideContentProps {
  title: string;
  description: string;
  image: any;
  isActive: boolean;
}

const SlideContent = ({ title, description, image, isActive }: SlideContentProps) => {
  const titleOpacity = useSharedValue(isActive ? 1 : 0);
  const titleY      = useSharedValue(isActive ? 0 : 28);
  const descOpacity = useSharedValue(isActive ? 1 : 0);
  const descY       = useSharedValue(isActive ? 0 : 20);

  useEffect(() => {
    if (isActive) {
      titleOpacity.value = withDelay(100, withTiming(1, { duration: 500, easing: EASING }));
      titleY.value       = withDelay(100, withTiming(0, { duration: 500, easing: EASING }));
      descOpacity.value  = withDelay(260, withTiming(1, { duration: 460, easing: EASING }));
      descY.value        = withDelay(260, withTiming(0, { duration: 460, easing: EASING }));
    } else {
      titleOpacity.value = withTiming(0, { duration: 180 });
      titleY.value       = withTiming(20, { duration: 180 });
      descOpacity.value  = withTiming(0, { duration: 140 });
      descY.value        = withTiming(14, { duration: 140 });
    }
  }, [isActive]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const descStyle = useAnimatedStyle(() => ({
    opacity: descOpacity.value,
    transform: [{ translateY: descY.value }],
  }));

  return (
    <View style={{ width, height, backgroundColor: "#081C14" }}>
      {/* Bounded image section */}
      <View style={styles.imageWrapper}>
        <Image source={image} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(8,28,20,0.6)", "transparent"]}
          locations={[0, 0.3]}
          style={[StyleSheet.absoluteFillObject]}
          pointerEvents="none"
        />
        {/* Bottom fade into dark section */}
        <LinearGradient
          colors={["transparent", "rgba(8,28,20,0.55)", "rgba(8,28,20,1)"]}
          locations={[0.5, 0.82, 1]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      </View>

      {/* Text section on dark background */}
      <View style={styles.textContainer}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowBar} />
          <Text style={styles.eyebrow}>GHANA TOURISM</Text>
        </View>
        <Animated.Text style={[styles.title, titleStyle]}>{title}</Animated.Text>
        <Animated.Text style={[styles.description, descStyle]}>{description}</Animated.Text>
      </View>
    </View>
  );
};

export default SlideContent;

const styles = StyleSheet.create({
  imageWrapper: {
    width,
    height: IMAGE_HEIGHT,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    paddingHorizontal: 28,
    paddingTop: 22,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  eyebrowBar: {
    width: 22,
    height: 2,
    backgroundColor: "#F2C94C",
    borderRadius: 2,
  },
  eyebrow: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 11,
    letterSpacing: 3.5,
    color: "#F2C94C",
  },
  title: {
    fontFamily: "PoppinsBold",
    fontSize: 28,
    lineHeight: 36,
    color: "#FFFFFF",
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  description: {
    fontFamily: "PoppinsRegular",
    fontSize: 15,
    lineHeight: 24,
    color: "rgba(255,255,255,0.62)",
  },
});
