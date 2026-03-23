import { useWnaAppData, useWnaTheme } from "@components/WnaAppContext";
import WnaSurfaceCard from "@/components/cards/WnaSurfaceCard";
import WnaMenuHeaderRight from "@/navigation/components/WnaMenuHeaderRight";
import WnaNavigationHeaderButtonRight from "@/navigation/components/WnaNavigationHeaderButtonRight";
import WnaExperienceCard from "@components/sections/WnaExperienceCard";
import { useNavigation, useRouter } from "expo-router";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import WnaScrollViewScreen from "./WnaScrollViewScreen";
import { i18nKeys } from "@/i18n/i18nKeys";

export default function WnaExperienceRoute(): ReactNode {
  const { appColors, appStyle } = useWnaTheme();
  const { appData } = useWnaAppData();
  const { t } = useTranslation(["common"]);
  const navigation = useNavigation();
  const router = useRouter();

  return (
    <WnaScrollViewScreen
      isRootPage
      showFooter={false}
      headerTitle={t(i18nKeys.screenTitleExperience)}
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
          t={t}
          navigation={navigation}
        />
      }
    >
      <WnaSurfaceCard appColors={appColors}>
        <WnaExperienceCard
          appColors={appColors}
          appData={appData}
          appStyle={appStyle}
          t={t}
        />
      </WnaSurfaceCard>
    </WnaScrollViewScreen>
  );
}
