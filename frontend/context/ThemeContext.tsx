import React, { createContext, useContext, useEffect, useState } from "react";
import { View, useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
import { vars } from "nativewind";

export type ThemeMode = "system" | "light" | "dark";

export interface AppColors {
  background: string;
  surface: string;
  dark: string;
  muted: string;
  primary: {
    DEFAULT: string;
    50: string; 100: string; 200: string; 300: string;
    400: string; 500: string; 600: string; 700: string; 800: string; 900: string;
  };
  secondary: {
    DEFAULT: string;
    50: string; 100: string; 200: string; 300: string;
    400: string; 500: string; 600: string; 700: string; 800: string; 900: string;
  };
  error: string;
  success: string;
  accent: string;
}

const PRIMARY_BASE = {
  DEFAULT: "#1F7A63",
  50: "#E6F4F1", 100: "#CDE9E3", 200: "#9BD3C7", 300: "#69BDAB",
  400: "#37A78F", 500: "#1F7A63", 600: "#18604F", 700: "#12463B",
  800: "#0C2D27", 900: "#061613",
};

const SECONDARY_BASE = {
  DEFAULT: "#F2C94C",
  50: "#FFF8E1", 100: "#FDEFC3", 200: "#FBE18A", 300: "#F8D451",
  400: "#F5C61F", 500: "#F2C94C", 600: "#C79E2E", 700: "#9C741F",
  800: "#6F4F14", 900: "#3A280A",
};

export const lightColors: AppColors = {
  background: "#F9FAFB",
  surface: "#FFFFFF",
  dark: "#1C1C1C",
  muted: "#6B7280",
  primary: PRIMARY_BASE,
  secondary: SECONDARY_BASE,
  error: "#EF4444",
  success: "#10B981",
  accent: "#56CCF2",
};

export const darkColors: AppColors = {
  background: "#0D1A16",
  surface: "#152B23",
  dark: "#EAF0EE",
  muted: "#8B9E98",
  primary: {
    ...PRIMARY_BASE,
    50: "#1C3A30",
    100: "#224036",
  },
  secondary: {
    ...SECONDARY_BASE,
    50: "rgba(242,201,76,0.12)",
    100: "rgba(242,201,76,0.2)",
  },
  error: "#EF4444",
  success: "#10B981",
  accent: "#56CCF2",
};

const LIGHT_VARS = vars({
  "--background": lightColors.background,
  "--surface": lightColors.surface,
  "--text-dark": lightColors.dark,
  "--muted": lightColors.muted,
} as any);

const DARK_VARS = vars({
  "--background": darkColors.background,
  "--surface": darkColors.surface,
  "--text-dark": darkColors.dark,
  "--muted": darkColors.muted,
} as any);

interface ThemeContextType {
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  colors: AppColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORE_KEY = "tourghana_theme";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(STORE_KEY).then((val) => {
      if (val === "light" || val === "dark" || val === "system") {
        setThemeModeState(val as ThemeMode);
      }
      setLoaded(true);
    });
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await SecureStore.setItemAsync(STORE_KEY, mode);
  };

  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" && systemScheme === "dark");

  const colors = isDark ? darkColors : lightColors;

  // Render with default light theme while loading preference from store
  return (
    <ThemeContext.Provider
      value={{
        isDark: loaded ? isDark : false,
        themeMode: loaded ? themeMode : "system",
        setThemeMode,
        colors: loaded ? colors : lightColors,
      }}
    >
      <View style={[{ flex: 1 }, loaded && isDark ? DARK_VARS : LIGHT_VARS]}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export const useThemeColors = () => useTheme().colors;
