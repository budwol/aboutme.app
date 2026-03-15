import Toast from "react-native-toast-message";
import { AppData } from "@/app-data";
import { Dimensions, Text, useColorScheme, View } from "react-native";
import { ErrorBoundaryProps } from "expo-router";
import { FC, PropsWithChildren, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useWnaAppData,
  useWnaAppLifecycle,
  useWnaLayout,
  useWnaTheme,
} from "@components/WnaAppContext";
import { Theme } from "@services/wnaAsyncStorageProvider";
import { resolveAppColors } from "@utils/themeColors";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "red",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "white", marginBottom: 12 }}>{error.message}</Text>
      <Text style={{ color: "white" }} onPress={retry}>
        Try Again?
      </Text>
    </View>
  );
}

export type AppComponentProps = PropsWithChildren<{
  appData: AppData;
  theme: Theme;
}>;

const WnaApp: FC<AppComponentProps> = ({ children, appData, theme }) => {
  const colorScheme = useColorScheme();
  const dimensionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isAppInitialized, setIsAppInitialized } = useWnaAppLifecycle();
  const { appLayout, setDimensions } = useWnaLayout();
  const { setAppColors, setTheme } = useWnaTheme();
  const { setAppData } = useWnaAppData();

  /**
   * ✅ Dimensions Listener (kein Multi-State-Setzen mehr)
   */
  useEffect(() => {
    const handleChange = () => {
      if (dimensionTimerRef.current) {
        clearTimeout(dimensionTimerRef.current);
      }

      dimensionTimerRef.current = setTimeout(() => {
        setDimensions(); // 🔥 nur EIN Context Update
      }, 100);
    };

    const subscription = Dimensions.addEventListener("change", handleChange);

    // Initial einmal setzen
    setDimensions();

    return () => {
      if (dimensionTimerRef.current) {
        clearTimeout(dimensionTimerRef.current);
      }
      subscription.remove();
    };
  }, [setDimensions]);

  /**
   * ✅ Initialisierung (nur einmal!)
   */
  useEffect(() => {
    setTheme(theme);
    setAppData(appData);
    setAppColors(resolveAppColors(theme, colorScheme));
    setIsAppInitialized(true);
  }, [
    appData,
    colorScheme,
    setAppColors,
    setAppData,
    setIsAppInitialized,
    setTheme,
    theme,
  ]);

  if (!isAppInitialized) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colorScheme === "dark" ? "#111" : "#fff",
        }}
      />
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, overflow: "hidden" }}
      edges={["left", "right", "bottom"]}
    >
      {children}
      <Toast
        position="bottom"
        bottomOffset={(appLayout?.footerHeight ?? 0) + 16}
      />
    </SafeAreaView>
  );
};

export default WnaApp;
