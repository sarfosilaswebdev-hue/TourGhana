import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";

interface SkeletonBlockProps {
  width: number | string;
  height: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonBlock = ({
  width,
  height,
  borderRadius = 8,
  style,
}: SkeletonBlockProps) => {
  const { isDark } = useTheme();
  const translateX = useRef(new Animated.Value(-1)).current;

  const baseColor = isDark ? "#1C3A30" : "#E5E7EB";
  const shimmerColors: [string, string, string] = [
    "transparent",
    isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.6)",
    "transparent",
  ];

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: baseColor,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: "60%",
          transform: [
            {
              translateX: translateX.interpolate({
                inputRange: [-1, 1],
                outputRange: [
                  typeof width === "number" ? -width : -300,
                  typeof width === "number" ? width * 1.6 : 480,
                ],
              }),
            },
          ],
        }}
      >
        <LinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};
