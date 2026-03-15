export const appLayoutConstants = {
  contentPaddingBottom: 16,
  contentPaddingBottomWhenActionButton: 72,
  footerHeight: 12,
  maxContentWidth: 1120,
  globalCornerRadius: 8,
  globalHeroImageHeight: 256,
  globalListGap: 24,
  headerButtonHeight: 56,
  headerHeightNative: 56 + 44,
  headerHeightWeb: 72,
  scrollBarPadding: 16,
  scrollEventThrottle: 32,
  tabBarHeight: 32,
  textInputHeight: 42,
};

export interface AppLayout {
  backgroundImageUrl: string;
  contentListPaddingTop: number;
  contentPaddingBottom: number;
  contentPaddingBottomWhenActionButton: number;
  footerHeight: number;
  maxContentWidth: number;
  globalCornerRadius: number;
  globalHeroImageHeight: number;
  globalListGap: number;
  headerButtonHeight: number;
  headerHeight: number;
  scrollBarPadding: number;
  scrollEventThrottle: number;
  tabBarHeight: number;
}

export function getAppLayout(isLandscape: boolean) {
  const headerHeightLandscape = appLayoutConstants.headerHeightWeb;
  const headerHeightPortrait = appLayoutConstants.headerButtonHeight;
  return {
    headerButtonHeight: appLayoutConstants.headerButtonHeight,
    headerHeight: isLandscape ? headerHeightLandscape : headerHeightPortrait,
    footerHeight: appLayoutConstants.footerHeight,
    maxContentWidth: appLayoutConstants.maxContentWidth,
    scrollBarPadding: appLayoutConstants.scrollBarPadding,
    backgroundImageUrl: "/bg.webp",
    globalCornerRadius: appLayoutConstants.globalCornerRadius,
    contentListPaddingTop: isLandscape
      ? headerHeightLandscape
      : headerHeightPortrait + 8,
    contentPaddingBottom: appLayoutConstants.contentPaddingBottom,
    contentPaddingBottomWhenActionButton:
      appLayoutConstants.contentPaddingBottomWhenActionButton,
    globalListGap: appLayoutConstants.globalListGap,
    scrollEventThrottle: appLayoutConstants.scrollEventThrottle,
    tabBarHeight: appLayoutConstants.tabBarHeight,
    globalHeroImageHeight: appLayoutConstants.globalHeroImageHeight,
  } as AppLayout;
}

export const actionButtonRightConstants = {
  size: 52,
  marginBottom: 16,
  marginRightLandscape: 32,
  marginRightPortrait: 32,
} as const;
