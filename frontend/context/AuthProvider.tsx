import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth as useClerkAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

const Logo = require("../assets/images/Logo.png");

const TRACK_WIDTH = 200;

const LoadingScreen = () => {
  const [percent, setPercent] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate progress: rush to 70% in 800ms, crawl to 90% over 2s
    Animated.sequence([
      Animated.timing(progress, {
        toValue: 70,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(progress, {
        toValue: 90,
        duration: 2000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();

    const id = progress.addListener(({ value }) => {
      setPercent(Math.round(value));
    });
    return () => progress.removeListener(id);
  }, []);

  const barWidth = progress.interpolate({
    inputRange: [0, 100],
    outputRange: [0, TRACK_WIDTH],
  });

  return (
    <View style={styles.loader}>
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
      </Animated.View>

      <View style={styles.progressWrap}>
        {/* Track */}
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width: barWidth }]} />
        </View>
        {/* Percentage label */}
        <Text style={styles.percentLabel}>{percent}%</Text>
      </View>
    </View>
  );
};

interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState(null);
  const router = useRouter();
  const { isSignedIn, userId, isLoaded } = useClerkAuth();
  const queryClient = useQueryClient();

  // Track the previous userId so we detect account switches even when
  // isSignedIn stays `true` (e.g. Google account picker switching accounts).
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded) return;

    const prevUserId = prevUserIdRef.current;
    const currentUserId = userId ?? null;

    // Not the first run and identity changed → wipe every cached query
    // so no data from the old account leaks into the new session.
    if (prevUserId !== undefined && prevUserId !== currentUserId) {
      queryClient.clear();
    }

    prevUserIdRef.current = currentUserId;

    if (isSignedIn) {
      router.replace("/(tabs)/Home");
    } else if (prevUserId !== undefined) {
      // Was signed in before (or just switched out) → go back to onboarding
      router.replace("/(onboarding)/onboard");
    }
  }, [isLoaded, isSignedIn, userId]);

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 48,
  },
  logo: {
    width: 200,
    height: 90,
  },
  progressWrap: {
    alignItems: "center",
    gap: 10,
  },
  track: {
    width: TRACK_WIDTH,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#E6F4F1",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: "#1F7A63",
  },
  percentLabel: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 12,
    color: "#1F7A63",
    letterSpacing: 1,
  },
});
