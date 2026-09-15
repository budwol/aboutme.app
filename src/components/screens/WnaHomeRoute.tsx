import WnaSurfaceCard from "@/components/cards/WnaSurfaceCard";
import {
  useWnaAppData,
  useWnaLayout,
  useWnaTheme,
} from "@/state/WnaAppContext";
import WnaMenuToggleButton from "@/navigation/components/WnaMenuToggleButton";
import WnaHeaderRouteButton from "@/navigation/components/WnaHeaderRouteButton";
import { useWnaNavigationTransition } from "@/navigation/hooks/useWnaNavigationTransition";
import WnaSeparatorHorizontal from "@components/display/WnaSeparatorHorizontal";
import WnaBaseScreen from "@components/screens/WnaBaseScreen";
import WnaContactFooter from "@components/chrome/WnaContactFooter";
import { useWnaScrollY } from "@components/screens/useWnaScrollY";
import WnaExperienceSection from "@components/sections/WnaExperienceSection";
import WnaProjectsSection from "@components/sections/WnaProjectsSection";
import WnaProfileSection from "@components/sections/WnaProfileSection";
import { appLayoutConstants } from "@constants/layoutConstants";
import { appMotionConstants } from "@constants/motionConstants";
import { i18nKeys } from "@/i18n/i18nKeys";
import {
  getNavigationLang,
  getNavigationPath,
  getProjectNavigationPath,
} from "@/navigation/routes/wnaNavigationRoutes";
import { createProjectSlug } from "@utils/projectRoutes";
import { router } from "@/navigation/router/wnaRouter";
import React, {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

const separatorSpace = appLayoutConstants.contentPaddingBottom;
const styles = {
  content: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
} satisfies Record<string, CSSProperties>;

function SectionCard({
  appColors,
  children,
}: {
  appColors: ReturnType<typeof useWnaTheme>["appColors"];
  children: ReactNode;
}) {
  return (
    <>
      <WnaSurfaceCard appColors={appColors}>{children}</WnaSurfaceCard>
      <WnaSeparatorHorizontal transparent space={separatorSpace} />
    </>
  );
}

export default function WnaHomeRoute(): ReactNode {
  const { appColors, appStyle } = useWnaTheme();
  const { appData } = useWnaAppData();
  const { appLayout } = useWnaLayout();
  const { t } = useTranslation(["common"]);
  const appBrand = t(i18nKeys.appBrand);
  const navigationRouter = useWnaNavigationTransition(router);
  const { scrollY, onScroll } = useWnaScrollY();
  const lang = getNavigationLang();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showDeferredSections, setShowDeferredSections] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let animationFrameId: number | null = null;

    animationFrameId = requestAnimationFrame(() => {
      timeoutId = setTimeout(() => {
        setShowDeferredSections(true);
      }, appMotionConstants.deferredHomeSectionsDelay);
    });

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const scrollContainerStyle: CSSProperties = useMemo(
    () => ({
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
      paddingTop: appLayout.contentListPaddingTop,
      paddingBottom: appLayout.contentPaddingBottom,
    }),
    [appLayout.contentListPaddingTop, appLayout.contentPaddingBottom],
  );

  const handleProjectPress = useCallback(
    (index: number) => {
      const project = appData.projects[index];
      if (!project) return;

      navigationRouter.push(
        getProjectNavigationPath(createProjectSlug(project.title, index), lang),
      );
    },
    [appData.projects, lang, navigationRouter],
  );

  const handleTitlePress = useCallback(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleExperiencePress = useCallback(() => {
    navigationRouter.push(getNavigationPath("experience", lang));
  }, [lang, navigationRouter]);

  const handleProjectsPress = useCallback(() => {
    navigationRouter.push(getNavigationPath("projects", lang));
  }, [lang, navigationRouter]);

  return (
    <WnaBaseScreen
      isRootPage
      headerTitle={appBrand}
      documentTitle={`${appBrand} - ${appData.profile.name}`}
      icon="home"
      onTitlePress={handleTitlePress}
      scrollY={scrollY}
      headerButton0={
        <WnaHeaderRouteButton
          appStyle={appStyle}
          appColors={appColors}
          router={router}
          route="projects"
          t={t}
        />
      }
      headerButton1={
        <WnaMenuToggleButton appStyle={appStyle} appColors={appColors} t={t} />
      }
    >
      {React.createElement(
        "div",
        {
          ref: scrollContainerRef,
          style: scrollContainerStyle,
          onScroll,
        },
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              ...appStyle.containerCenterMaxWidth,
            } as CSSProperties,
          },
          <SectionCard appColors={appColors}>
            <WnaProfileSection
              appColors={appColors}
              appData={appData}
              appStyle={appStyle}
              t={t}
            />
          </SectionCard>,
          showDeferredSections ? (
            <>
              <SectionCard appColors={appColors}>
                <WnaExperienceSection
                  appColors={appColors}
                  appData={appData}
                  appStyle={appStyle}
                  t={t}
                  maxItems={4}
                  footerActionLabel={t(i18nKeys.actionShowMore)}
                  onFooterActionPress={handleExperiencePress}
                />
              </SectionCard>

              <SectionCard appColors={appColors}>
                <WnaProjectsSection
                  appColors={appColors}
                  appData={appData}
                  appStyle={appStyle}
                  t={t}
                  onProjectPress={handleProjectPress}
                  onShowMorePress={handleProjectsPress}
                />
              </SectionCard>

              {React.createElement(
                "div",
                { style: styles.content },
                <WnaContactFooter showTopSpacing={false} />,
              )}
            </>
          ) : null,
        ),
      )}
    </WnaBaseScreen>
  );
}
