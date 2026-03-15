import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import WnaSeparatorHorizontal from "@components/misc/WnaSeparatorHorizontal";
import { getNavigationBaseUrl } from "@components/navigation/wnaNavigationRouteProvider";
import WnaBaseScreen from "@components/screens/WnaBaseScreen";
import { useWnaScrollY } from "@components/screens/useWnaScrollY";
import WnaShareCard from "@components/welcome/WnaShareCard";
import { useWnaLayout, useWnaTheme } from "@components/WnaAppContext";
import { SeoEntry } from "@constants/seoCatalog";
import { i18nKeys } from "@services/i18n/i18nKeys";
import Animated from "react-native-reanimated";
import { FC, memo, ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export type WnaScrollViewScreenProps = {
  children?: ReactNode;
  isBusy?: boolean;
  isBusyText?: string | null;
  backgroundImageUrl?: string;
  onCancel?: () => void;
  preventBack?: boolean;
  askBeforeBack?: boolean;
  seoEntry: SeoEntry;
  iconName?: keyof typeof iconMap;
  headerButton0?: ReactNode;
  headerButton1?: ReactNode;
  headerButton2?: ReactNode;
  isRootPage?: boolean;
  showFooter?: boolean;
  showHeaderShadow?: boolean;
  showAppStoreButtons?: boolean;
};

type WnaScrollViewFooterProps = {
  title: string;
  url: string;
};

const WnaScrollViewFooter = memo(({ title, url }: WnaScrollViewFooterProps) => {
  return (
    <>
      <WnaSeparatorHorizontal transparent space={16} />
      <WnaShareCard url={url} title={title} />
    </>
  );
});

WnaScrollViewFooter.displayName = "WnaScrollViewFooter";

const WnaScrollViewScreen: FC<WnaScrollViewScreenProps> = ({
  children,
  seoEntry,
  iconName,
  headerButton0,
  headerButton1,
  headerButton2,
  isRootPage,
  showFooter,
  showAppStoreButtons,
}) => {
  const { appStyle } = useWnaTheme();
  const { appLayout } = useWnaLayout();
  const { t } = useTranslation(["common"]);
  const { scrollY, onScroll } = useWnaScrollY();
  const footerTitle = t(i18nKeys.appBrand);
  const shareUrl = getNavigationBaseUrl();

  const contentContainerStyle = useMemo(
    () => ({
      paddingTop: appLayout.contentListPaddingTop,
      paddingBottom: appLayout.contentPaddingBottom,
    }),
    [appLayout.contentListPaddingTop, appLayout.contentPaddingBottom],
  );

  return (
    <WnaBaseScreen
      isRootPage={isRootPage}
      seoEntry={seoEntry}
      icon={iconName}
      scrollY={scrollY}
      headerButton0={headerButton0}
      headerButton1={headerButton1}
      headerButton2={headerButton2}
      showAppStoreButtons={showAppStoreButtons}
    >
      <Animated.ScrollView
        contentContainerStyle={contentContainerStyle}
        scrollEventThrottle={appLayout.scrollEventThrottle}
        onScroll={onScroll}
      >
        <View style={appStyle.containerCenterMaxWidth}>
          {children}
          {showFooter && (
            <WnaScrollViewFooter title={footerTitle} url={shareUrl} />
          )}
        </View>
      </Animated.ScrollView>
    </WnaBaseScreen>
  );
};

export default WnaScrollViewScreen;
