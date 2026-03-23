import WnaSurfaceCard from "@/components/cards/WnaSurfaceCard";
import {
  useWnaAppData,
  useWnaLayout,
  useWnaTheme,
} from "@components/WnaAppContext";
import WnaMenuHeaderRight from "@/navigation/components/WnaMenuHeaderRight";
import WnaNavigationHeaderButtonRight from "@/navigation/components/WnaNavigationHeaderButtonRight";
import { useWnaNavigationTransition } from "@/navigation/hooks/useWnaNavigationTransition";
import WnaSeparatorHorizontal from "@components/display/WnaSeparatorHorizontal";
import WnaBaseScreen from "@components/screens/WnaBaseScreen";
import WnaContactFooter from "@components/screens/WnaContactFooter";
import { useWnaScrollY } from "@components/screens/useWnaScrollY";
import WnaExperienceCard from "@components/sections/WnaExperienceCard";
import WnaProjectsCard from "@components/sections/WnaProjectsCard";
import WnaProfileCard from "@components/sections/WnaProfileCard";
import { appLayoutConstants } from "@constants/layoutConstants";
import { appMotionConstants } from "@constants/motionConstants";
import { i18nKeys } from "@/i18n/i18nKeys";
import {
  getDrawerNavigationPath,
  getDrawerProjectNavigationPath,
  getNavigationLang,
} from "@/navigation/routes/wnaNavigationRouteProvider";
import { createProjectSlug } from "@utils/projectRoutes";
import { useNavigation, useRouter } from "expo-router";
import Animated from "react-native-reanimated";
import {
  ElementRef,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

const separatorSpace = appLayoutConstants.contentPaddingBottom;
const styles = StyleSheet.create({
  content: {
    width: "100%",
  },
});

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
  const router = useRouter();
  const navigationRouter = useWnaNavigationTransition(router);
  const navigation = useNavigation();
  const { scrollY, onScroll } = useWnaScrollY();
  const lang = getNavigationLang();
  const scrollViewRef = useRef<ElementRef<typeof Animated.ScrollView>>(null);
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

  const contentContainerStyle = useMemo(
    () => ({
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
        getDrawerProjectNavigationPath(
          createProjectSlug(project.title, index),
          lang,
        ),
      );
    },
    [appData.projects, lang, navigationRouter],
  );

  const handleTitlePress = useCallback(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const handleExperiencePress = useCallback(() => {
    navigationRouter.push(getDrawerNavigationPath("experience", lang));
  }, [lang, navigationRouter]);

  const handleProjectsPress = useCallback(() => {
    navigationRouter.push(getDrawerNavigationPath("projects", lang));
  }, [lang, navigationRouter]);

  return (
    <WnaBaseScreen
      isRootPage
      headerTitle={t(i18nKeys.appBrand)}
      icon="home"
      onTitlePress={handleTitlePress}
      scrollY={scrollY}
      headerButton0={
        <WnaNavigationHeaderButtonRight
          appStyle={appStyle}
          appColors={appColors}
          router={router}
          route="projects"
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
      <Animated.ScrollView
        ref={scrollViewRef}
        contentContainerStyle={contentContainerStyle}
        scrollEventThrottle={appLayout.scrollEventThrottle}
        onScroll={onScroll}
      >
        <View style={appStyle.containerCenterMaxWidth}>
          <SectionCard appColors={appColors}>
            <WnaProfileCard
              appColors={appColors}
              appData={appData}
              appStyle={appStyle}
              t={t}
            />
          </SectionCard>

          {showDeferredSections ? (
            <>
              <SectionCard appColors={appColors}>
                <WnaExperienceCard
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
                <WnaProjectsCard
                  appColors={appColors}
                  appData={appData}
                  appStyle={appStyle}
                  t={t}
                  onProjectPress={handleProjectPress}
                  onShowMorePress={handleProjectsPress}
                />
              </SectionCard>

              <View style={styles.content}>
                <WnaContactFooter showTopSpacing={false} />
              </View>
            </>
          ) : null}
        </View>
      </Animated.ScrollView>
    </WnaBaseScreen>
  );
}
