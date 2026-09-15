import {
  useWnaAppData,
  useWnaLayout,
  useWnaTheme,
} from "@/state/WnaAppContext";
import WnaSurfaceCard from "@components/cards/WnaSurfaceCard";
import WnaMenuToggleButton from "@/navigation/components/WnaMenuToggleButton";
import WnaHeaderRouteButton from "@/navigation/components/WnaHeaderRouteButton";
import {
  getNavigationLang,
  getNavigationPath,
} from "@/navigation/routes/wnaNavigationRoutes";
import WnaScrollViewScreen from "@components/screens/WnaScrollViewScreen";
import WnaSectionTitle from "@components/text/WnaSectionTitle";
import WnaTechStackSection from "@components/sections/WnaTechStackSection";
import { getLangCode } from "@/i18n/i18n";
import { i18nKeys } from "@/i18n/i18nKeys";
import { findProjectBySlug } from "@utils/projectRoutes";
import WnaRedirect from "@/navigation/router/WnaRedirect";
import { router } from "@/navigation/router/wnaRouter";
import React, { CSSProperties, ReactNode, useMemo, useState } from "react";
import { Linking } from "@utils/webLinking";
import { useTranslation } from "react-i18next";
import WnaPrivateRepoModal from "./WnaPrivateRepoModal";
import WnaProjectDescription from "./WnaProjectDescription";
import WnaProjectDetailsContext from "./WnaProjectDetailsContext";
import WnaProjectHero from "./WnaProjectHero";
import { styles } from "./wnaProjectDetailsRouteStyles";
import type { WnaProjectLink } from "./wnaProjectDetailsRouteTypes";

export type WnaProjectDetailsRouteProps = {
  slug?: string;
};

export default function WnaProjectDetailsRoute({
  slug,
}: WnaProjectDetailsRouteProps): ReactNode {
  const { appColors, appStyle } = useWnaTheme();
  const { appData } = useWnaAppData();
  const { currentWindowWidth, isLandscape } = useWnaLayout();
  const { t } = useTranslation(["common"]);
  const [isPrivateRepoModalVisible, setIsPrivateRepoModalVisible] =
    useState(false);
  const projectMatch = useMemo(
    () => findProjectBySlug(appData.projects, slug),
    [appData.projects, slug],
  );

  if (!projectMatch) {
    return (
      <WnaRedirect
        href={getNavigationPath("projects", getNavigationLang(getLangCode()))}
      />
    );
  }

  const { project } = projectMatch;
  const lang = getNavigationLang(getLangCode());
  const privateRepoMailToUrl = `mailto:${appData.contact.email}?subject=${encodeURIComponent(
    `Repository review: ${project.title}`,
  )}&body=${encodeURIComponent(
    `Hello,\n\nI would be interested in a review of the project "${project.title}".\n\nBest regards`,
  )}`;
  const projectLinks: WnaProjectLink[] = [
    {
      url: project.repoUrl,
      label: t(i18nKeys.actionGithub),
      icon: "github" as const,
    },
    {
      url: project.webUrl,
      label: t(i18nKeys.actionWebApp),
      icon: "web" as const,
    },
    {
      url: project.playStoreUrl,
      label: t(i18nKeys.actionPlayStore),
      icon: "google-play" as const,
    },
  ].filter((link): link is WnaProjectLink => Boolean(link.url));
  const handleProjectLinkPress = (link: WnaProjectLink) => {
    if (link.icon === "github" && project.repoVisibility === "private") {
      setIsPrivateRepoModalVisible(true);
      return;
    }

    Linking.openURL(link.url);
  };

  return (
    <WnaScrollViewScreen
      headerTitle={project.title}
      iconName="rocket-launch-outline"
      titleHref={getNavigationPath("projects", lang)}
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
        <WnaMenuToggleButton appStyle={appStyle} appColors={appColors} t={t} />
      }
    >
      <WnaSurfaceCard appColors={appColors}>
        {React.createElement(
          "div",
          { style: styles.cardContent as CSSProperties },
          <WnaProjectHero
            appColors={appColors}
            appStyle={appStyle}
            currentWindowWidth={currentWindowWidth}
            isLandscape={isLandscape}
            project={project}
            projectLinks={projectLinks}
            t={t}
            onProjectLinkPress={handleProjectLinkPress}
          />,
          <WnaSectionTitle
            appColors={appColors}
            appStyle={appStyle}
            title={project.title}
            subtitle={project.context}
          />,
          React.createElement(
            "div",
            { style: styles.contentBody as CSSProperties },
            React.createElement(
              "div",
              { style: styles.stackGroup as CSSProperties },
              project.techstack.length > 0 ? (
                <WnaTechStackSection
                  appColors={appColors}
                  appData={appData}
                  appStyle={appStyle}
                  t={t}
                  groups={[
                    {
                      key: "project-techstack",
                      title: t(i18nKeys.titleProjectTechstack),
                      stack: project.techstack,
                    },
                  ]}
                />
              ) : null,
            ),
            React.createElement(
              "div",
              { style: styles.contentSection as CSSProperties },
              appData.projectDetailsContext ? (
                <WnaProjectDetailsContext
                  appColors={appColors}
                  appStyle={appStyle}
                  context={appData.projectDetailsContext}
                />
              ) : null,
              project.description ? (
                <WnaProjectDescription
                  appColors={appColors}
                  appStyle={appStyle}
                  description={project.description}
                />
              ) : null,
            ),
          ),
        )}
        <WnaPrivateRepoModal
          appColors={appColors}
          appStyle={appStyle}
          privateRepoMailToUrl={privateRepoMailToUrl}
          project={project}
          t={t}
          visible={isPrivateRepoModalVisible}
          onClose={() => setIsPrivateRepoModalVisible(false)}
        />
      </WnaSurfaceCard>
    </WnaScrollViewScreen>
  );
}
