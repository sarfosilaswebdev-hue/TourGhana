import { ActivityIndicator, StyleSheet, View } from "react-native";
import React, { createContext, useContext, useEffect, useRef } from "react";
import { useAuth as useClerkAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

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
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#F2C94C" />
      </View>
    );
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
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
