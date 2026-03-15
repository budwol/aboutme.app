import { ProjectEntry } from "@/app-data";
import {
  useWnaAppData,
  useWnaLayout,
  useWnaTheme,
} from "@components/WnaAppContext";
import WnaPressable from "@components/buttons/WnaPressable";
import WnaHeroImage from "@components/images/WnaHeroImage";
import { getProjectImageForWidth } from "@components/images/wnaImageAssetResolver";
import WnaMenuHeaderRight from "@components/navigation/WnaMenuHeaderRight";
import WnaNavigationHeaderButtonRight from "@components/navigation/WnaNavigationHeaderButtonRight";
import {
  getDrawerNavigationPath,
  getDrawerProjectNavigationPath,
  getNavigationLang,
} from "@components/navigation/wnaNavigationRouteProvider";
import WnaBaseScreen from "@components/screens/WnaBaseScreen";
import WnaContactFooter from "@components/screens/WnaContactFooter";
import { useWnaScrollY } from "@components/screens/useWnaScrollY";
import { i18nKeys } from "@services/i18n/i18nKeys";
import { convertHexToRgba } from "@utils/colorConverter";
import { createProjectSlug } from "@utils/projectRoutes";
import { useNavigation, useRouter } from "expo-router";
import Animated from "react-native-reanimated";
import { ReactNode, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
  itemSeparator: {
    height: 16,
  },
  projectCard: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
  },
  projectImage: {
    width: "100%",
    height: 240,
  },
  projectOverlay: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    padding: 20,
    alignItems: "flex-start",
    justifyContent: "flex-end",
    gap: 6,
  },
  projectSubtitle: {
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  projectTitle: {
    lineHeight: 31,
    letterSpacing: 0.4,
  },
  projectTitleBackground: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  projectSubtitleBackground: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  projectContextBackground: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
    maxWidth: "92%",
  },
  projectContext: {
    lineHeight: 18,
  },
});

export default function WnaProjectsRoute(): ReactNode {
  const { appColors, appStyle } = useWnaTheme();
  const { appData } = useWnaAppData();
  const { appLayout, currentWindowWidth } = useWnaLayout();
  const { t } = useTranslation(["common"]);
  const navigation = useNavigation();
  const router = useRouter();
  const { scrollY, onScroll } = useWnaScrollY();
  const projectImageWidth = currentWindowWidth;
  const lang = getNavigationLang();

  const itemSeparator = useCallback(
    () => <View style={styles.itemSeparator} />,
    [],
  );
  const contentContainerStyle = useMemo(
    () => ({
      paddingBottom: appLayout.contentPaddingBottom,
      paddingTop: appLayout.contentListPaddingTop,
      paddingHorizontal: 16,
    }),
    [appLayout.contentListPaddingTop, appLayout.contentPaddingBottom],
  );
  const renderItem = useCallback(
    (item: ProjectEntry, index: number) => (
      <View style={appStyle.containerCenterMaxWidth}>
        <WnaPressable
          ripple={appColors.isDark ? "light" : "dark"}
          checkInternetConnection={false}
          t={t}
          onPress={() =>
            router.push(
              getDrawerProjectNavigationPath(
                createProjectSlug(item.title, index),
                lang,
              ),
            )
          }
        >
          <View
            style={[
              styles.projectCard,
              {
                backgroundColor: convertHexToRgba(appColors.warmgray6, 0.22),
                borderColor: convertHexToRgba(appColors.coolgray2, 0.58),
              },
            ]}
          >
            <WnaHeroImage
              appColors={appColors}
              imageUrl={`images/${getProjectImageForWidth(item, projectImageWidth)}`}
              imageTitle={item.title}
              showGradient={true}
              borderRadius={0}
              style={styles.projectImage}
            />

            <View style={styles.projectOverlay}>
              <View
                style={[
                  styles.projectTitleBackground,
                  {
                    backgroundColor: convertHexToRgba(
                      appColors.staticCoolgray8,
                      0.84,
                    ),
                  },
                ]}
              >
                <Text
                  style={[
                    appStyle.textExtraLarge,
                    styles.projectTitle,
                    { color: appColors.staticWhite },
                  ]}
                >
                  {item.title}
                </Text>
              </View>
              {item.subtitle ? (
                <View
                  style={[
                    styles.projectSubtitleBackground,
                    {
                      backgroundColor: convertHexToRgba(
                        appColors.staticCoolgray8,
                        0.84,
                      ),
                    },
                  ]}
                >
                  <Text
                    style={[
                      appStyle.textSmall,
                      styles.projectSubtitle,
                      {
                        color: appColors.staticWhite,
                        fontWeight: "400",
                        lineHeight: 16,
                      },
                    ]}
                  >
                    {item.subtitle}
                  </Text>
                </View>
              ) : null}
              {item.context ? (
                <View
                  style={[
                    styles.projectContextBackground,
                    {
                      backgroundColor: convertHexToRgba(
                        appColors.staticCoolgray8,
                        0.78,
                      ),
                    },
                  ]}
                >
                  <Text
                    style={[
                      appStyle.textSmall,
                      styles.projectContext,
                      {
                        color: appColors.staticWhite,
                        fontStyle: "italic",
                      },
                    ]}
                  >
                    {item.context}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </WnaPressable>
      </View>
    ),
    [appColors, appStyle, lang, projectImageWidth, router, t],
  );

  return (
    <WnaBaseScreen
      isRootPage
      headerTitle={t(i18nKeys.screenTitleProjects)}
      titleHref={getDrawerNavigationPath("root", lang)}
      scrollY={scrollY}
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
      <Animated.FlatList
        scrollEventThrottle={appLayout.scrollEventThrottle}
        onScroll={onScroll}
        keyExtractor={(item) => item.title}
        ItemSeparatorComponent={itemSeparator}
        data={appData.projects}
        contentContainerStyle={contentContainerStyle}
        ListFooterComponent={<WnaContactFooter />}
        renderItem={({ item, index }) => renderItem(item, index)}
      />
    </WnaBaseScreen>
  );
}
