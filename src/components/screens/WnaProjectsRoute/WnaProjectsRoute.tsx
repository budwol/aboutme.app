import { ProjectEntry } from "@/app-data";
import {
  useWnaAppData,
  useWnaLayout,
  useWnaTheme,
} from "@components/WnaAppContext";
import WnaPressable from "@components/buttons/WnaPressable";
import WnaHeroImage from "@components/images/WnaHeroImage";
import { getProjectImageForWidth } from "@components/images/wnaImageAssetResolver";
import WnaMenuHeaderRight from "@/navigation/components/WnaMenuHeaderRight";
import WnaNavigationHeaderButtonRight from "@/navigation/components/WnaNavigationHeaderButtonRight";
import { useWnaNavigationTransition } from "@/navigation/hooks/useWnaNavigationTransition";
import {
  getDrawerNavigationPath,
  getDrawerProjectNavigationPath,
  getNavigationLang,
} from "@/navigation/routes/wnaNavigationRouteProvider";
import WnaBaseScreen from "@components/screens/WnaBaseScreen";
import WnaContactFooter from "@components/screens/WnaContactFooter";
import { useWnaScrollY } from "@components/screens/useWnaScrollY";
import { i18nKeys } from "@/i18n/i18nKeys";
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
  portraitCardWrap: {
    width: "100%",
  },
  landscapeScrollContent: {
    width: "100%",
    alignItems: "center",
  },
  landscapeShell: {
    width: "100%",
    maxWidth: 1480,
    paddingHorizontal: 28,
  },
  landscapeLayout: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 32,
  },
  landscapeIntro: {
    width: 324,
    flexShrink: 0,
    alignSelf: "stretch",
    gap: 20,
    paddingTop: 20,
  },
  landscapeIntroTop: {
    gap: 18,
  },
  landscapeIntroLine: {
    width: 80,
    height: 8,
    borderRadius: 999,
  },
  landscapeEyebrow: {
    letterSpacing: 1.5,
    textTransform: "uppercase",
    opacity: 0.78,
  },
  landscapeTitle: {
    lineHeight: 50,
    letterSpacing: 0.2,
  },
  landscapeIntroBox: {
    paddingHorizontal: 24,
    paddingVertical: 22,
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
  },
  landscapeContext: {
    lineHeight: 24,
  },
  landscapeProjects: {
    flex: 1,
    minWidth: 0,
    gap: 22,
  },
  landscapeGrid: {
    flexDirection: "row",
    gap: 18,
  },
  landscapeGridColumn: {
    flex: 1,
    gap: 18,
  },
  landscapeGridItem: {
    minWidth: 0,
  },
  projectCard: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
  },
  projectCardPortrait: {
    borderRadius: 12,
  },
  projectCardLandscape: {
    minHeight: 260,
  },
  projectCardFeatured: {
    minHeight: 360,
  },
  projectImage: {
    width: "100%",
    height: 240,
  },
  projectImageLandscape: {
    height: 260,
  },
  projectImageFeatured: {
    height: 360,
  },
  projectOverlay: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    padding: 20,
    justifyContent: "flex-end",
  },
  projectOverlayFeatured: {
    padding: 30,
  },
  projectMetaPanel: {
    maxWidth: 380,
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  projectMetaPanelFeatured: {
    maxWidth: 500,
    paddingHorizontal: 22,
    paddingVertical: 20,
    gap: 10,
  },
  projectSubtitle: {
    letterSpacing: 1.1,
    textTransform: "uppercase",
    opacity: 0.84,
  },
  projectTitle: {
    lineHeight: 31,
    letterSpacing: 0.2,
  },
  projectTitleFeatured: {
    fontSize: 34,
    lineHeight: 40,
  },
  projectContext: {
    lineHeight: 19,
  },
  projectContextFeatured: {
    lineHeight: 22,
  },
  footerWrap: {
    width: "100%",
    marginTop: 22,
  },
});

export default function WnaProjectsRoute(): ReactNode {
  const { appColors, appStyle } = useWnaTheme();
  const { appData } = useWnaAppData();
  const { appLayout, currentWindowWidth, isLandscape } = useWnaLayout();
  const { t } = useTranslation(["common"]);
  const navigation = useNavigation();
  const router = useRouter();
  const navigationRouter = useWnaNavigationTransition(router);
  const { scrollY, onScroll } = useWnaScrollY();
  const lang = getNavigationLang();
  const projects = appData.projects;
  const featuredProject = projects[0];
  const gridProjects = projects.slice(1);
  const gridProjectColumns = useMemo(
    () =>
      gridProjects.reduce<[ProjectEntry[], ProjectEntry[]]>(
        (columns, item, index) => {
          columns[index % 2].push(item);
          return columns;
        },
        [[], []],
      ),
    [gridProjects],
  );

  const projectImageWidth = useMemo(() => {
    if (!isLandscape) {
      return currentWindowWidth;
    }

    return Math.max(640, Math.round(currentWindowWidth * 0.66));
  }, [currentWindowWidth, isLandscape]);

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

  const landscapeContentContainerStyle = useMemo(
    () => ({
      paddingBottom: appLayout.contentPaddingBottom,
      paddingTop: appLayout.contentListPaddingTop,
    }),
    [appLayout.contentListPaddingTop, appLayout.contentPaddingBottom],
  );

  const renderProjectCard = useCallback(
    (
      item: ProjectEntry,
      index: number,
      {
        featured = false,
        landscapeVariant = false,
      }: { featured?: boolean; landscapeVariant?: boolean } = {},
    ) => {
      const card = (
        <WnaPressable
          ripple={appColors.isDark ? "light" : "dark"}
          checkInternetConnection={false}
          t={t}
          onPress={() =>
            navigationRouter.push(
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
              !landscapeVariant && styles.projectCardPortrait,
              landscapeVariant && styles.projectCardLandscape,
              featured && styles.projectCardFeatured,
              {
                backgroundColor: convertHexToRgba(
                  landscapeVariant
                    ? appColors.staticWhite
                    : appColors.warmgray6,
                  landscapeVariant ? 0.78 : 0.14,
                ),
                borderColor: convertHexToRgba(
                  appColors.coolgray2,
                  landscapeVariant ? 0.44 : 0.54,
                ),
              },
            ]}
          >
            <WnaHeroImage
              appColors={appColors}
              imageUrl={`images/${getProjectImageForWidth(item, projectImageWidth)}`}
              imageTitle={item.title}
              showGradient={true}
              borderRadius={0}
              style={[
                styles.projectImage,
                landscapeVariant && styles.projectImageLandscape,
                featured && styles.projectImageFeatured,
              ]}
            />

            <View
              style={[
                styles.projectOverlay,
                featured && styles.projectOverlayFeatured,
              ]}
            >
              <View
                style={[
                  styles.projectMetaPanel,
                  featured && styles.projectMetaPanelFeatured,
                  {
                    backgroundColor: convertHexToRgba(
                      appColors.staticCoolgray8,
                      featured ? 0.72 : 0.8,
                    ),
                    borderColor: convertHexToRgba(appColors.staticWhite, 0.16),
                  },
                ]}
              >
                {item.subtitle ? (
                  <Text
                    style={[
                      appStyle.textSmall,
                      styles.projectSubtitle,
                      { color: appColors.staticWhite },
                    ]}
                    numberOfLines={1}
                  >
                    {item.subtitle}
                  </Text>
                ) : null}

                <Text
                  style={[
                    appStyle.textExtraLarge,
                    styles.projectTitle,
                    featured && styles.projectTitleFeatured,
                    { color: appColors.staticWhite },
                  ]}
                  numberOfLines={featured ? 2 : 1}
                >
                  {item.title}
                </Text>

                {item.context ? (
                  <Text
                    style={[
                      appStyle.textSmall,
                      styles.projectContext,
                      featured && styles.projectContextFeatured,
                      {
                        color: convertHexToRgba(appColors.staticWhite, 0.9),
                        fontStyle:
                          landscapeVariant && !featured ? "italic" : "normal",
                      },
                    ]}
                    numberOfLines={featured ? 3 : 2}
                  >
                    {item.context}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        </WnaPressable>
      );

      if (landscapeVariant) {
        return card;
      }

      return <View style={styles.portraitCardWrap}>{card}</View>;
    },
    [appColors, appStyle, lang, navigationRouter, projectImageWidth, t],
  );

  const renderLandscapeLayout = useMemo(() => {
    return (
      <Animated.ScrollView
        scrollEventThrottle={appLayout.scrollEventThrottle}
        onScroll={onScroll}
        contentContainerStyle={landscapeContentContainerStyle}
      >
        <View style={styles.landscapeScrollContent}>
          <View style={styles.landscapeShell}>
            <View style={styles.landscapeLayout}>
              <View style={styles.landscapeIntro}>
                <View style={styles.landscapeIntroTop}>
                  <View
                    style={[
                      styles.landscapeIntroLine,
                      { backgroundColor: appColors.staticAccent5 },
                    ]}
                  />

                  <Text
                    style={[
                      appStyle.textSmall,
                      styles.landscapeEyebrow,
                      { color: appColors.staticCoolgray2 },
                    ]}
                  >
                    {(appData.projectsSubtitle ?? "").toUpperCase()}
                  </Text>

                  <Text
                    style={[
                      appStyle.textExtraLarge,
                      styles.landscapeTitle,
                      { color: appColors.staticWhite },
                    ]}
                  >
                    {t(i18nKeys.screenTitleProjects)}
                  </Text>
                </View>

                {appData.projectsContext ? (
                  <View
                    style={[
                      styles.landscapeIntroBox,
                      {
                        backgroundColor: convertHexToRgba(
                          appColors.staticWhite,
                          0.2,
                        ),
                        borderColor: convertHexToRgba(
                          appColors.staticCoolgray8,
                          0.64,
                        ),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        appStyle.textSmall,
                        styles.landscapeContext,
                        { color: appColors.staticWhite, opacity: 0.82 },
                      ]}
                    >
                      {appData.projectsContext}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.landscapeProjects}>
                {featuredProject
                  ? renderProjectCard(featuredProject, 0, {
                      featured: true,
                      landscapeVariant: true,
                    })
                  : null}

                {gridProjects.length > 0 ? (
                  <View style={styles.landscapeGrid}>
                    {gridProjectColumns.map((column, columnIndex) => (
                      <View
                        key={`projects-column-${columnIndex}`}
                        style={styles.landscapeGridColumn}
                      >
                        {column.map((item) => {
                          const projectIndex = projects.findIndex(
                            (project) => project.title === item.title,
                          );

                          return (
                            <View
                              key={`${item.title}-${projectIndex}`}
                              style={styles.landscapeGridItem}
                            >
                              {renderProjectCard(item, projectIndex, {
                                landscapeVariant: true,
                              })}
                            </View>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>

            <View style={[appStyle.containerCenterMaxWidth, styles.footerWrap]}>
              <WnaContactFooter />
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    );
  }, [
    appColors,
    appData.projectsContext,
    appData.projectsSubtitle,
    appLayout.scrollEventThrottle,
    appStyle,
    featuredProject,
    gridProjectColumns,
    gridProjects.length,
    landscapeContentContainerStyle,
    onScroll,
    projects,
    renderProjectCard,
    t,
  ]);

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
      {isLandscape ? (
        renderLandscapeLayout
      ) : (
        <Animated.FlatList
          scrollEventThrottle={appLayout.scrollEventThrottle}
          onScroll={onScroll}
          keyExtractor={(item) => item.title}
          ItemSeparatorComponent={itemSeparator}
          data={projects}
          contentContainerStyle={contentContainerStyle}
          ListFooterComponent={<WnaContactFooter />}
          renderItem={({ item, index }) => renderProjectCard(item, index)}
        />
      )}
    </WnaBaseScreen>
  );
}
