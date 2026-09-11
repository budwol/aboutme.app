import {
  useWnaAppLifecycle,
  useWnaLayout,
  useWnaTheme,
} from "@/state/WnaAppContext";
import WnaHtmlRenderer from "@components/content/WnaHtmlRenderer";
import WnaMenuToggleButton from "@/navigation/components/WnaMenuToggleButton";
import WnaHeaderRouteButton from "@/navigation/components/WnaHeaderRouteButton";
import {
  getDrawerNavigationPath,
  getNavigationLang,
} from "@/navigation/routes/wnaNavigationRoutes";
import { appLayoutConstants } from "@constants/layoutConstants";
import { getLangCode } from "@/i18n/i18n";
import { convertHexToRgba } from "@utils/colorConverter";
import { Redirect, useNavigation, useRouter } from "expo-router";
import { ReactNode } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import WnaScrollViewScreen from "@components/screens/WnaScrollViewScreen";

export type WnaLegalDocumentScreenProps = {
  headerTitle: string;
  htmlContent: string;
};

export default function WnaLegalDocumentScreen({
  headerTitle,
  htmlContent,
}: WnaLegalDocumentScreenProps): ReactNode {
  const { isAppInitialized } = useWnaAppLifecycle();
  const { appColors, appStyle } = useWnaTheme();
  const { currentWindowWidth } = useWnaLayout();
  const navigation = useNavigation();
  const router = useRouter();
  const { t } = useTranslation(["common"]);
  const lang = getNavigationLang(getLangCode());

  if (!isAppInitialized) {
    return <Redirect href={getDrawerNavigationPath("menu", lang)} />;
  }

  return (
    <WnaScrollViewScreen
      headerTitle={headerTitle}
      showContactFooter={false}
      headerButton0={
        <WnaHeaderRouteButton
          appStyle={appStyle}
          appColors={appColors}
          router={router}
          route="home"
          t={t}
        />
      }
      headerButton1={
        <WnaMenuToggleButton
          appStyle={appStyle}
          appColors={appColors}
          navigation={navigation}
          t={t}
        />
      }
    >
      <View
        style={{
          backgroundColor: appColors.white,
          borderRadius: appLayoutConstants.globalCornerRadius,
          borderColor: convertHexToRgba(appColors.coolgray2, 0.5),
          borderWidth: 1,
        }}
      >
        <WnaHtmlRenderer
          appStyle={appStyle}
          appColors={appColors}
          width={currentWindowWidth}
          html={htmlContent}
          padding={24}
        />
      </View>
    </WnaScrollViewScreen>
  );
}
