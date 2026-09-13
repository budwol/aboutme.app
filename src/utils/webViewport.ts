export type WebViewportDimensions = {
  screenWidth: number;
  screenHeight: number;
  windowWidth: number;
  windowHeight: number;
  isLandscape: boolean;
};

export function getWebViewportDimensions(): WebViewportDimensions {
  if (typeof window === "undefined") {
    return {
      screenWidth: 0,
      screenHeight: 0,
      windowWidth: 0,
      windowHeight: 0,
      isLandscape: false,
    };
  }

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const screenWidth = window.screen?.width || windowWidth;
  const screenHeight = window.screen?.height || windowHeight;

  return {
    screenWidth,
    screenHeight,
    windowWidth,
    windowHeight,
    isLandscape: windowWidth > windowHeight,
  };
}
