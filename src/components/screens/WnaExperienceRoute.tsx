import { useWnaAppData, useWnaTheme } from "@/state/WnaAppContext";
import WnaSurfaceCard from "@/components/cards/WnaSurfaceCard";
import WnaMenuToggleButton from "@/navigation/components/WnaMenuToggleButton";
import WnaHeaderRouteButton from "@/navigation/components/WnaHeaderRouteButton";
import { getNavigationPath } from "@/navigation/routes/wnaNavigationRoutes";
import WnaExperienceSection from "@components/sections/WnaExperienceSection";
import { router } from "@/navigation/router/wnaRouter";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import WnaScrollViewScreen from "./WnaScrollViewScreen";
import { i18nKeys } from "@/i18n/i18nKeys";

export default function WnaExperienceRoute(): ReactNode {
  const { appColors, appStyle } = useWnaTheme();
  const { appData } = useWnaAppData();
  const { t } = useTranslation(["common"]);

  return (
    <WnaScrollViewScreen
      isRootPage
      headerTitle={t(i18nKeys.screenTitleExperience)}
      titleHref={getNavigationPath("root")}
      headerButton0={
        <WnaHeaderRouteButton
          appStyle={appStyle}
          appColors={appColors}
          router={router}
          route={"home"}
          t={t}
        />
      }
      headerButton1={
        <WnaMenuToggleButton appStyle={appStyle} appColors={appColors} t={t} />
      }
    >
      <WnaSurfaceCard appColors={appColors}>
        <WnaExperienceSection
          appColors={appColors}
          appData={appData}
          appStyle={appStyle}
          t={t}
        />
      </WnaSurfaceCard>
    </WnaScrollViewScreen>
  );
}
