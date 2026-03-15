import WnaListCardWhiteDecent from "@/components/cards/WnaListCardWhiteDecent";
import {
  useWnaAppData,
  useWnaLayout,
  useWnaTheme,
} from "@components/WnaAppContext";
import WnaMenuHeaderRight from "@components/navigation/WnaMenuHeaderRight";
import WnaNavigationHeaderButtonRight from "@components/navigation/WnaNavigationHeaderButtonRight";
import WnaSeparatorHorizontal from "@components/misc/WnaSeparatorHorizontal";
import WnaBaseScreen from "@components/screens/WnaBaseScreen";
import { useWnaScrollY } from "@components/screens/useWnaScrollY";
import WnaContactCard from "@components/welcome/WnaContactCard";
import WnaExperienceCard from "@components/welcome/WnaExperienceCard";
import WnaProjectsCard from "@components/welcome/WnaProjectsCard";
import WnaWelcomeCard from "@components/welcome/WnaWelcomeCard";
import { seoCatalog } from "@constants/seoCatalog";
import { useNavigation, useRouter } from "expo-router";
import Animated from "react-native-reanimated";
import { ReactNode, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

const SEPARATOR_SPACE = 16;

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
  const navigation = useNavigation();
  const { scrollY, onScroll } = useWnaScrollY();

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
        <WnaSeparatorHorizontal transparent space={SEPARATOR_SPACE} />
      </>
    ),
    [appColors],
  );

  return (
    <WnaBaseScreen
      isRootPage
      seoEntry={seoCatalog.root}
      icon="home"
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
            <WnaProjectsCard
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
            />
          </SectionCard>

          <View style={styles.content}>
            <WnaContactCard
              appColors={appColors}
              appData={appData}
              appStyle={appStyle}
              t={t}
            />
          </View>
        </View>
      </Animated.ScrollView>
    </WnaBaseScreen>
  );
}
