import { AppData, DEFAULT_APP_DATA } from "@/app-data";
import { AppLayout, getAppLayout } from "@constants/layoutConstants";
import { CurrentColors } from "@constants/currentColors";
import Colors from "@constants/theme/colors";
import AppStyle, { setAppStyle } from "@services/wnaStyleService";
import { Theme } from "@services/wnaAsyncStorageProvider";
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Dimensions } from "react-native";

type WnaLifecycleState = {
  isAppInitialized: boolean;
  setIsAppInitialized: (value: boolean) => void;
  isStatusBarVisible: boolean;
  setIsStatusBarVisible: (value: boolean) => void;
};

type WnaLayoutState = {
  currentScreenWidth: number;
  currentScreenHeight: number;
  currentWindowWidth: number;
  currentWindowHeight: number;
  isLandscape: boolean;
  setDimensions: () => void;
  appLayout: AppLayout;
};

type WnaThemeState = {
  appColors: Colors;
  setAppColors: (colors: Colors) => void;
  appStyle: AppStyle;
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

type WnaDataState = {
  appData: AppData;
  setAppData: (data: AppData) => void;
};

const getInitialDimensions = () => {
  const screen = Dimensions.get("screen");
  const window = Dimensions.get("window");

  return {
    screenWidth: screen.width,
    screenHeight: screen.height,
    windowWidth: window.width,
    windowHeight: window.height,
    isLandscape: window.width > window.height,
  };
};

const WnaLifecycleContext = createContext<WnaLifecycleState | null>(null);
const WnaLayoutContext = createContext<WnaLayoutState | null>(null);
const WnaThemeContext = createContext<WnaThemeState | null>(null);
const WnaDataContext = createContext<WnaDataState | null>(null);

function useRequiredContext<T>(
  context: React.Context<T | null>,
  name: string,
): T {
  const value = useContext(context);

  if (!value) {
    throw new Error(`${name} must be used within WnaAppContextProvider`);
  }

  return value;
}

export function useWnaAppLifecycle() {
  return useRequiredContext(WnaLifecycleContext, "useWnaAppLifecycle");
}

export function useWnaLayout() {
  return useRequiredContext(WnaLayoutContext, "useWnaLayout");
}

export function useWnaTheme() {
  return useRequiredContext(WnaThemeContext, "useWnaTheme");
}

export function useWnaAppData() {
  return useRequiredContext(WnaDataContext, "useWnaAppData");
}

export const WnaAppContextProvider = ({ children }: PropsWithChildren) => {
  const initialColors = CurrentColors.light;
  const dimensions = getInitialDimensions();

  const [isAppInitialized, setIsAppInitialized] = useState(false);
  const [isStatusBarVisible, setIsStatusBarVisible] = useState(true);
  const [appData, setAppData] = useState<AppData>(DEFAULT_APP_DATA);
  const [theme, setTheme] = useState<Theme>("system");
  const [appColors, setAppColors] = useState<Colors>(initialColors);

  const [currentScreenWidth, setCurrentScreenWidth] = useState(
    dimensions.screenWidth,
  );
  const [currentScreenHeight, setCurrentScreenHeight] = useState(
    dimensions.screenHeight,
  );
  const [currentWindowWidth, setCurrentWindowWidth] = useState(
    dimensions.windowWidth,
  );
  const [currentWindowHeight, setCurrentWindowHeight] = useState(
    dimensions.windowHeight,
  );
  const [isLandscape, setIsLandscape] = useState(dimensions.isLandscape);

  const setDimensions = useCallback(() => {
    const nextDimensions = getInitialDimensions();
    setCurrentScreenWidth(nextDimensions.screenWidth);
    setCurrentScreenHeight(nextDimensions.screenHeight);
    setCurrentWindowWidth(nextDimensions.windowWidth);
    setCurrentWindowHeight(nextDimensions.windowHeight);
    setIsLandscape(nextDimensions.isLandscape);
  }, []);

  const appStyle = useMemo(() => setAppStyle(appColors), [appColors]);
  const appLayout = useMemo(() => getAppLayout(isLandscape), [isLandscape]);

  const lifecycleValue = useMemo(
    () => ({
      isAppInitialized,
      setIsAppInitialized,
      isStatusBarVisible,
      setIsStatusBarVisible,
    }),
    [isAppInitialized, isStatusBarVisible],
  );

  const layoutValue = useMemo(
    () => ({
      currentScreenWidth,
      currentScreenHeight,
      currentWindowWidth,
      currentWindowHeight,
      isLandscape,
      setDimensions,
      appLayout,
    }),
    [
      appLayout,
      currentScreenHeight,
      currentScreenWidth,
      currentWindowHeight,
      currentWindowWidth,
      isLandscape,
      setDimensions,
    ],
  );

  const themeValue = useMemo(
    () => ({
      appColors,
      setAppColors,
      appStyle,
      theme,
      setTheme,
    }),
    [appColors, appStyle, theme],
  );

  const dataValue = useMemo(
    () => ({
      appData,
      setAppData,
    }),
    [appData],
  );

  return (
    <WnaLifecycleContext.Provider value={lifecycleValue}>
      <WnaLayoutContext.Provider value={layoutValue}>
        <WnaThemeContext.Provider value={themeValue}>
          <WnaDataContext.Provider value={dataValue}>
            {children}
          </WnaDataContext.Provider>
        </WnaThemeContext.Provider>
      </WnaLayoutContext.Provider>
    </WnaLifecycleContext.Provider>
  );
};
