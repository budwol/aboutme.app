import {
  useWnaAppData,
  useWnaLayout,
  useWnaTheme,
} from "@/state/WnaAppContext";
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
  const { isLandscape } = useWnaLayout();
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
          // In portrait the header sits right above this card and already
          // reads "Berufliche Tätigkeiten" -- repeating it as the section
          // title just stacks the same words. The home page (no such
          // header) and landscape (header off to the side) keep it.
          showTitle={isLandscape}
        />
      </WnaSurfaceCard>
    </WnaScrollViewScreen>
  );
}
