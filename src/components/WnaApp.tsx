import Toast, { ToastConfig } from "react-native-toast-message";
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
        retry
      </Text>
    </View>
  );
}

export type AppComponentProps = PropsWithChildren<{
  appData: AppData;
  theme: Theme;
}>;

function renderToastCard(accentColor: string, text1?: string, text2?: string) {
  return (
    <View
      style={{
        width: "100%",
        maxWidth: 420,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: accentColor,
        backgroundColor: "#ffffff",
        paddingHorizontal: 16,
        paddingVertical: 14,
      }}
    >
      {text1 ? (
        <Text style={{ fontSize: 15, fontWeight: "700", color: "#181818" }}>
          {text1}
        </Text>
      ) : null}
      {text2 ? (
        <Text
          style={{
            marginTop: text1 ? 4 : 0,
            fontSize: 13,
            lineHeight: 18,
            color: "#404040",
          }}
        >
          {text2}
        </Text>
      ) : null}
    </View>
  );
}

const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => renderToastCard("#69C779", text1, text2),
  info: ({ text1, text2 }) => renderToastCard("#87CEFA", text1, text2),
  error: ({ text1, text2 }) => renderToastCard("#FE6301", text1, text2),
};

const WnaApp: FC<AppComponentProps> = ({ children, appData, theme }) => {
  const colorScheme = useColorScheme();
  const dimensionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isAppInitialized, setIsAppInitialized } = useWnaAppLifecycle();
  const { appLayout, setDimensions } = useWnaLayout();
  const { setAppColors, setTheme } = useWnaTheme();
  const { setAppData } = useWnaAppData();

  useEffect(() => {
    const handleChange = () => {
      if (dimensionTimerRef.current) {
        clearTimeout(dimensionTimerRef.current);
      }

      dimensionTimerRef.current = setTimeout(() => {
        setDimensions();
      }, 100);
    };

    const subscription = Dimensions.addEventListener("change", handleChange);

    // set the initial layout once on mount
    setDimensions();

    return () => {
      if (dimensionTimerRef.current) {
        clearTimeout(dimensionTimerRef.current);
      }
      subscription.remove();
    };
  }, [setDimensions]);

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
        config={toastConfig}
        position="bottom"
        bottomOffset={(appLayout?.footerHeight ?? 0) + 16}
      />
    </SafeAreaView>
  );
};

export default WnaApp;
