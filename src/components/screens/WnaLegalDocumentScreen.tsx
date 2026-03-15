import {
  useWnaAppLifecycle,
  useWnaLayout,
  useWnaTheme,
} from "@components/WnaAppContext";
import WnaHtmlRenderer from "@components/misc/WnaHtmlRenderer";
import {
  getDrawerNavigationPath,
  getNavigationLang,
} from "@components/navigation/wnaNavigationRouteProvider";
import { appLayoutConstants } from "@constants/layoutConstants";
import { getLangCode } from "@services/i18n/i18n";
import { convertHexToRgba } from "@utils/colorConverter";
import { Redirect } from "expo-router";
import { ReactNode } from "react";
import { View } from "react-native";
import WnaScrollViewScreen from "./WnaScrollViewScreen";

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

  if (!isAppInitialized) {
    return (
      <Redirect
        href={getDrawerNavigationPath("menu", getNavigationLang(getLangCode()))}
      />
    );
  }

  return (
    <WnaScrollViewScreen headerTitle={headerTitle} showContactFooter={false}>
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
