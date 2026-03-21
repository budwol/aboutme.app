import { useWnaAppLifecycle, useWnaTheme } from "@components/WnaAppContext";
import WnaListCardWhiteDecent from "@components/cards/WnaListCardWhiteDecent";
import WnaMenuHeaderRight from "@components/navigation/WnaMenuHeaderRight";
import WnaNavigationHeaderButtonRight from "@components/navigation/WnaNavigationHeaderButtonRight";
import WnaNavigationItem from "@components/navigation/WnaNavigationItem";
import { useWnaNavigationTransition } from "@components/navigation/useWnaNavigationTransition";
import {
  getDrawerNavigationPath,
  getNavigationLang,
} from "@components/navigation/wnaNavigationRouteProvider";
import WnaSeparatorHorizontal from "@components/misc/WnaSeparatorHorizontal";
import { getLangCode } from "@services/i18n/i18n";
import { i18nKeys } from "@services/i18n/i18nKeys";
import { useNavigation, useRouter } from "expo-router";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Text, ViewStyle } from "react-native";
import WnaScrollViewScreen from "./WnaScrollViewScreen";

export default function WnaMenuRoute(): ReactNode {
  const { isAppInitialized } = useWnaAppLifecycle();
  const { appColors, appStyle } = useWnaTheme();
  const router = useRouter();
  const navigationRouter = useWnaNavigationTransition(router);
  const navigation = useNavigation();
  const { t } = useTranslation(["common"]);
  const lang = getNavigationLang(getLangCode());
  const styleSectionHeadline = [
    appStyle.textNeutralMedium,
    {
      textTransform: "uppercase",
      color: appColors.coolgray5,
    },
  ] as ViewStyle[];

  if (!isAppInitialized) return null;

  return (
    <WnaScrollViewScreen
      isRootPage
      headerTitle={t(i18nKeys.screenTitleMenuWithoutDots)}
      showContactFooter={false}
      showAppStoreButtons={false}
      headerButton0={
        <WnaNavigationHeaderButtonRight
          appStyle={appStyle}
          appColors={appColors}
          router={router}
          route={"home"}
          t={t}
        />
      }
      headerButton1={
        <WnaMenuHeaderRight
          appStyle={appStyle}
          appColors={appColors}
          navigation={navigation}
          t={t}
        />
      }
    >
      <WnaListCardWhiteDecent appColors={appColors}>
        <Text style={styleSectionHeadline}>{t(i18nKeys.wordLegal)}</Text>
        <WnaSeparatorHorizontal space={4} transparent={true} />
        <WnaNavigationItem
          appStyle={appStyle}
          appColors={appColors}
          text={t(i18nKeys.screenTitleDisclaimer)}
          iconName={"scale-balance"}
          type={"first"}
          onPress={() =>
            navigationRouter.navigate(
              getDrawerNavigationPath("disclaimer", lang),
            )
          }
          t={t}
        />
        <WnaNavigationItem
          appStyle={appStyle}
          appColors={appColors}
          text={t("common:screenTitlePrivacy")}
          iconName={"shield-account"}
          type={"middle"}
          onPress={() =>
            navigationRouter.navigate(getDrawerNavigationPath("privacy", lang))
          }
          t={t}
        />
        <WnaNavigationItem
          appStyle={appStyle}
          appColors={appColors}
          text={t(i18nKeys.screenTitleTerms)}
          iconName={"file-sign"}
          type={"middle"}
          onPress={() =>
            navigationRouter.navigate(getDrawerNavigationPath("terms", lang))
          }
          t={t}
        />
        <WnaNavigationItem
          appStyle={appStyle}
          appColors={appColors}
          text={t(i18nKeys.screenTitleLicenses)}
          iconName={"certificate-outline"}
          type={"last"}
          onPress={() =>
            navigationRouter.navigate(getDrawerNavigationPath("licenses", lang))
          }
          t={t}
        />
      </WnaListCardWhiteDecent>
    </WnaScrollViewScreen>
  );
}
