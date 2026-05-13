import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React, { createContext, useContext, useEffect } from "react";
import { useClerk } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useUser } from "@/hooks/user.hook";

interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState(null);
  const router = useRouter();
  const { isSignedIn, loaded } = useClerk();

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/(tabs)/Home");
    }
  }, [isSignedIn]);

  if (!loaded) {
    return (
      <ActivityIndicator
        size="large"
        color="#F2C94C"
        className="flex-1 justify-center items-center"
      />
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

const styles = StyleSheet.create({});
