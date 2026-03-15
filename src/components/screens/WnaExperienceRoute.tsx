import { useWnaAppData, useWnaTheme } from "@components/WnaAppContext";
import WnaListCardWhiteDecent from "@/components/cards/WnaListCardWhiteDecent";
import WnaMenuHeaderRight from "@components/navigation/WnaMenuHeaderRight";
import WnaNavigationHeaderButtonRight from "@components/navigation/WnaNavigationHeaderButtonRight";
import WnaExperienceCard from "@components/welcome/WnaExperienceCard";
import { seoCatalog } from "@constants/seoCatalog";
import { useNavigation, useRouter } from "expo-router";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import WnaScrollViewScreen from "./WnaScrollViewScreen";

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
      seoEntry={seoCatalog.experience}
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
      <WnaListCardWhiteDecent appColors={appColors}>
        <WnaExperienceCard
          appColors={appColors}
          appData={appData}
          appStyle={appStyle}
          t={t}
        />
      </WnaListCardWhiteDecent>
    </WnaScrollViewScreen>
  );
}
