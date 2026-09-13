import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import WnaBaseScreen from "@components/screens/WnaBaseScreen";
import WnaContactFooter from "@components/chrome/WnaContactFooter";
import { useWnaScrollY } from "@components/screens/useWnaScrollY";
import { useWnaLayout, useWnaTheme } from "@/state/WnaAppContext";
import { Href } from "expo-router";
import { FC, ReactNode, useMemo } from "react";
import { ScrollView, View } from "react-native";

export type WnaScrollViewScreenProps = {
  children?: ReactNode;
  isBusy?: boolean;
  isBusyText?: string | null;
  backgroundImageUrl?: string;
  onCancel?: () => void;
  backHref?: Href;
  titleHref?: Href;
  preventBack?: boolean;
  askBeforeBack?: boolean;
  headerTitle?: string;
  iconName?: keyof typeof iconMap;
  headerButton0?: ReactNode;
  headerButton1?: ReactNode;
  headerButton2?: ReactNode;
  isRootPage?: boolean;
  showContactFooter?: boolean;
  showHeaderShadow?: boolean;
  showAppStoreButtons?: boolean;
};

const WnaScrollViewScreen: FC<WnaScrollViewScreenProps> = ({
  children,
  backgroundImageUrl,
  headerTitle,
  iconName,
  backHref,
  titleHref,
  headerButton0,
  headerButton1,
  headerButton2,
  isRootPage,
  showContactFooter = true,
  showAppStoreButtons,
}) => {
  const { appStyle } = useWnaTheme();
  const { appLayout } = useWnaLayout();
  const { scrollY, onScroll } = useWnaScrollY();

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
      headerTitle={headerTitle}
      icon={iconName}
      backgroundImageUrl={backgroundImageUrl}
      backHref={backHref}
      titleHref={titleHref}
      scrollY={scrollY}
      headerButton0={headerButton0}
      headerButton1={headerButton1}
      headerButton2={headerButton2}
      showAppStoreButtons={showAppStoreButtons}
    >
      <ScrollView
        contentContainerStyle={contentContainerStyle}
        scrollEventThrottle={appLayout.scrollEventThrottle}
        onScroll={onScroll}
      >
        <View style={appStyle.containerCenterMaxWidth}>
          {children}
          {showContactFooter && <WnaContactFooter />}
        </View>
      </ScrollView>
    </WnaBaseScreen>
  );
};

export default WnaScrollViewScreen;
