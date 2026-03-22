import WnaListCardWhiteDecent from "@/components/cards/WnaListCardWhiteDecent";
import {
  useWnaAppData,
  useWnaLayout,
  useWnaTheme,
} from "@components/WnaAppContext";
import WnaMenuHeaderRight from "@components/navigation/WnaMenuHeaderRight";
import WnaNavigationHeaderButtonRight from "@components/navigation/WnaNavigationHeaderButtonRight";
import { useWnaNavigationTransition } from "@components/navigation/useWnaNavigationTransition";
import WnaSeparatorHorizontal from "@components/misc/WnaSeparatorHorizontal";
import WnaBaseScreen from "@components/screens/WnaBaseScreen";
import WnaContactFooter from "@components/screens/WnaContactFooter";
import { useWnaScrollY } from "@components/screens/useWnaScrollY";
import WnaExperienceCard from "@components/welcome/WnaExperienceCard";
import WnaProjectsCard from "@components/welcome/WnaProjectsCard";
import WnaWelcomeCard from "@components/welcome/WnaWelcomeCard";
import { appLayoutConstants } from "@constants/layoutConstants";
import { i18nKeys } from "@services/i18n/i18nKeys";
import {
  getDrawerNavigationPath,
  getDrawerProjectNavigationPath,
  getNavigationLang,
} from "@components/navigation/wnaNavigationRouteProvider";
import { createProjectSlug } from "@utils/projectRoutes";
import { useNavigation, useRouter } from "expo-router";
import Animated from "react-native-reanimated";
import { ElementRef, ReactNode, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

const separatorSpace = appLayoutConstants.contentPaddingBottom;

const styles = StyleSheet.create({
  content: {
    width: "100%",
  },
});

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

  const contentContainerStyle = useMemo(
    () => ({
      paddingTop: appLayout.contentListPaddingTop,
      paddingBottom: appLayout.contentPaddingBottom,
    }),
    [appLayout.contentListPaddingTop, appLayout.contentPaddingBottom],
  );

  const SectionCard = useCallback(
    ({ children }: { children: ReactNode }) => (
      <>
        <WnaListCardWhiteDecent appColors={appColors}>
          {children}
        </WnaListCardWhiteDecent>
        <WnaSeparatorHorizontal transparent space={separatorSpace} />
      </>
    ),
    [appColors],
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
          <SectionCard>
            <WnaWelcomeCard
              appColors={appColors}
              appData={appData}
              appStyle={appStyle}
              t={t}
            />
          </SectionCard>

          <SectionCard>
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

          <SectionCard>
            <WnaProjectsCard
              appColors={appColors}
              appData={appData}
              appStyle={appStyle}
              t={t}
              onProjectPress={handleProjectPress}
            />
          </SectionCard>

          <View style={styles.content}>
            <WnaContactFooter showTopSpacing={false} />
          </View>
        </View>
      </Animated.ScrollView>
    </WnaBaseScreen>
  );
}
