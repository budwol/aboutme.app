import { ProjectEntry } from "@/app-data";
import {
  useWnaAppData,
  useWnaLayout,
  useWnaTheme,
} from "@/state/WnaAppContext";
import WnaPressable from "@components/buttons/WnaPressable";
import WnaHeroImage from "@components/images/WnaHeroImage";
import { getProjectImageForWidth } from "@components/images/wnaImageAssetResolver";
import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import WnaMenuToggleButton from "@/navigation/components/WnaMenuToggleButton";
import WnaHeaderRouteButton from "@/navigation/components/WnaHeaderRouteButton";
import { useWnaNavigationTransition } from "@/navigation/hooks/useWnaNavigationTransition";
import {
  getNavigationLang,
  getNavigationPath,
  getProjectNavigationPath,
} from "@/navigation/routes/wnaNavigationRoutes";
import WnaBaseScreen from "@components/screens/WnaBaseScreen";
import WnaContactFooter from "@components/chrome/WnaContactFooter";
import { useWnaScrollY } from "@components/screens/useWnaScrollY";
import { i18nKeys } from "@/i18n/i18nKeys";
import { convertHexToRgba } from "@utils/colorConverter";
import { createProjectSlug } from "@utils/projectRoutes";
import { router } from "@/navigation/router/wnaRouter";
import React, {
  CSSProperties,
  Fragment,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";
import { lineClampStyle } from "@utils/lineClampStyle";
import { addToLineHeight } from "@utils/addToLineHeight";

const styles = {
  itemSeparator: {
    height: 16,
  },
  portraitCardWrap: {
    width: "100%",
  },
  landscapeScrollContent: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
  },
  landscapeShell: {
    width: "100%",
    boxSizing: "border-box",
    maxWidth: 1480,
    paddingInline: 28,
  },
  landscapeLayout: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 32,
  },
  landscapeIntro: {
    display: "flex",
    flexDirection: "column",
    width: 324,
    flexShrink: 0,
    alignSelf: "stretch",
    gap: 20,
    paddingTop: 20,
  },
  landscapeIntroTop: {
    display: "flex",
    flexDirection: "column",
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
    lineHeight: "50px",
    letterSpacing: 0.2,
  },
  landscapeIntroBox: {
    display: "flex",
    flexDirection: "column",
    paddingInline: 24,
    paddingBlock: 22,
    borderRadius: 22,
    borderWidth: 1,
    borderStyle: "solid",
    gap: 12,
  },
  landscapeFeatureBox: {
    display: "flex",
    flexDirection: "column",
    paddingInline: 22,
    paddingBlock: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "solid",
    gap: 14,
  },
  landscapeFeatureItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  landscapeFeatureIconWrap: {
    display: "flex",
    width: 34,
    height: 34,
    boxSizing: "border-box",
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "solid",
    flexShrink: 0,
  },
  landscapeFeatureText: {
    flex: 1,
    lineHeight: "20px",
  },
  landscapeContext: {
    lineHeight: "24px",
  },
  portraitIntro: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: 16,
    marginBottom: 20,
  },
  portraitContextBox: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    boxSizing: "border-box",
    paddingInline: 18,
    paddingBlock: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "solid",
    gap: 10,
  },
  portraitFeatureBox: {
    display: "flex",
    width: "100%",
    boxSizing: "border-box",
    paddingInline: 18,
    paddingBlock: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "solid",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  portraitFeatureItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingInline: 12,
    paddingBlock: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "solid",
  },
  portraitFeatureIconWrap: {
    display: "flex",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  portraitFeatureText: {
    lineHeight: "18px",
  },
  landscapeProjects: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: 0,
    gap: 22,
  },
  landscapeGrid: {
    display: "flex",
    flexDirection: "row",
    gap: 18,
  },
  landscapeGridColumn: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    gap: 18,
  },
  landscapeGridItem: {
    minWidth: 0,
  },
  projectCard: {
    position: "relative",
    width: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
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
    display: "flex",
    flexDirection: "column",
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
    display: "flex",
    flexDirection: "column",
    maxWidth: 380,
    alignSelf: "flex-start",
    paddingInline: 18,
    paddingBlock: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    gap: 8,
  },
  projectMetaPanelFeatured: {
    maxWidth: 500,
    paddingInline: 22,
    paddingBlock: 20,
    gap: 10,
  },
  projectSubtitle: {
    letterSpacing: 1.1,
    textTransform: "uppercase",
    opacity: 0.84,
  },
  projectTitle: {
    lineHeight: "31px",
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  projectTitleFeatured: {
    fontSize: 34,
    lineHeight: "40px",
  },
  projectContext: {
    lineHeight: "19px",
  },
  projectContextFeatured: {
    lineHeight: "22px",
  },
  footerWrap: {
    width: "100%",
    marginTop: 22,
  },
} satisfies Record<string, CSSProperties>;

function mergeStyles(
  ...parts: (object | false | null | undefined)[]
): CSSProperties {
  return Object.assign({}, ...parts.filter(Boolean)) as CSSProperties;
}

export default function WnaProjectsRoute(): ReactNode {
  const { appColors, appStyle } = useWnaTheme();
  const { appData } = useWnaAppData();
  const { appLayout, currentWindowWidth, isLandscape } = useWnaLayout();
  const { t } = useTranslation(["common"]);
  const navigationRouter = useWnaNavigationTransition(router);
  const { scrollY, onScroll, scrollContainerRef } = useWnaScrollY();
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
    () => React.createElement("div", { style: styles.itemSeparator }),
    [],
  );

  const scrollContainerStyle: CSSProperties = useMemo(
    () => ({
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
      paddingBottom: appLayout.contentPaddingBottom,
      paddingTop: appLayout.contentListPaddingTop,
      paddingInline: 16,
    }),
    [appLayout.contentListPaddingTop, appLayout.contentPaddingBottom],
  );

  const landscapeScrollContainerStyle: CSSProperties = useMemo(
    () => ({
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
      paddingBottom: appLayout.contentPaddingBottom,
      paddingTop: appLayout.contentListPaddingTop,
    }),
    [appLayout.contentListPaddingTop, appLayout.contentPaddingBottom],
  );

  const renderPortraitIntro = useMemo(() => {
    if (!appData.projectsContext && appData.projectsHighlights.length === 0) {
      return null;
    }

    return React.createElement(
      "div",
      { style: styles.portraitIntro },
      appData.projectsContext
        ? React.createElement(
            "div",
            {
              style: mergeStyles(styles.portraitContextBox, {
                backgroundColor: convertHexToRgba(appColors.staticWhite, 0.2),
                borderColor: convertHexToRgba(appColors.staticCoolgray8, 0.64),
              }),
            },
            React.createElement(
              "span",
              {
                style: mergeStyles(appStyle.textSmall, {
                  color: appColors.staticWhite,
                  lineHeight: addToLineHeight(
                    appStyle.textSmall?.lineHeight,
                    4,
                    16,
                  ),
                  opacity: 0.82,
                }),
              },
              appData.projectsContext,
            ),
          )
        : null,
      appData.projectsHighlights.length > 0
        ? React.createElement(
            "div",
            {
              style: mergeStyles(styles.portraitFeatureBox, {
                backgroundColor: convertHexToRgba(appColors.staticWhite, 0.14),
                borderColor: convertHexToRgba(appColors.staticCoolgray8, 0.56),
              }),
            },
            appData.projectsHighlights.map((item, index) =>
              React.createElement(
                "div",
                {
                  key: `portrait-project-highlight-${item.icon}-${item.text}-${index}`,
                  style: mergeStyles(styles.portraitFeatureItem, {
                    backgroundColor: convertHexToRgba(
                      appColors.staticCoolgray8,
                      0.42,
                    ),
                    borderColor: convertHexToRgba(appColors.staticWhite, 0.16),
                  }),
                },
                React.createElement(
                  "div",
                  {
                    style: mergeStyles(styles.portraitFeatureIconWrap, {
                      backgroundColor: convertHexToRgba(
                        appColors.staticWhite,
                        0.08,
                      ),
                    }),
                  },
                  <WnaIcon
                    iconName={item.icon as never}
                    size={18}
                    color={appColors.staticWhite}
                  />,
                ),
                React.createElement(
                  "span",
                  {
                    style: mergeStyles(
                      appStyle.textSmall,
                      styles.portraitFeatureText,
                      { color: appColors.staticWhite, opacity: 0.9 },
                    ),
                  },
                  item.text,
                ),
              ),
            ),
          )
        : null,
    );
  }, [
    appColors,
    appData.projectsContext,
    appData.projectsHighlights,
    appStyle,
  ]);

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
          accessibilityLabel={`Open project ${item.title}`}
          t={t}
          onPress={() =>
            navigationRouter.push(
              getProjectNavigationPath(
                createProjectSlug(item.title, index),
                lang,
              ),
            )
          }
        >
          {React.createElement(
            "div",
            {
              style: mergeStyles(
                styles.projectCard,
                !landscapeVariant && styles.projectCardPortrait,
                landscapeVariant && styles.projectCardLandscape,
                featured && styles.projectCardFeatured,
                {
                  backgroundColor: convertHexToRgba(
                    appColors.staticWhite,
                    0.14,
                  ),
                  borderColor: convertHexToRgba(
                    appColors.staticCoolgray8,
                    0.56,
                  ),
                },
              ),
            },
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
            />,
            React.createElement(
              "div",
              {
                style: mergeStyles(
                  styles.projectOverlay,
                  featured && styles.projectOverlayFeatured,
                ),
              },
              React.createElement(
                "div",
                {
                  style: mergeStyles(
                    styles.projectMetaPanel,
                    featured && styles.projectMetaPanelFeatured,
                    {
                      backgroundColor: convertHexToRgba(
                        appColors.staticCoolgray8,
                        featured ? 0.72 : 0.8,
                      ),
                      borderColor: convertHexToRgba(
                        appColors.staticWhite,
                        0.16,
                      ),
                    },
                  ),
                },
                item.subtitle
                  ? React.createElement(
                      "span",
                      {
                        style: mergeStyles(
                          appStyle.textSmall,
                          styles.projectSubtitle,
                          { color: appColors.staticWhite },
                          lineClampStyle(2),
                        ),
                      },
                      item.subtitle,
                    )
                  : null,
                React.createElement(
                  "span",
                  {
                    style: mergeStyles(
                      appStyle.textExtraLarge,
                      styles.projectTitle,
                      featured && styles.projectTitleFeatured,
                      { color: appColors.staticWhite },
                      lineClampStyle(featured ? 3 : 2),
                    ),
                  },
                  item.title,
                ),
              ),
            ),
          )}
        </WnaPressable>
      );

      if (landscapeVariant) {
        return card;
      }

      return React.createElement(
        "div",
        { style: styles.portraitCardWrap },
        card,
      );
    },
    [appColors, appStyle, lang, navigationRouter, projectImageWidth, t],
  );

  const renderLandscapeLayout = useMemo(() => {
    return React.createElement(
      "div",
      {
        ref: scrollContainerRef,
        style: landscapeScrollContainerStyle,
        onScroll,
      },
      React.createElement(
        "div",
        { style: styles.landscapeScrollContent },
        React.createElement(
          "div",
          { style: styles.landscapeShell },
          React.createElement(
            "div",
            { style: styles.landscapeLayout },
            React.createElement(
              "div",
              { style: styles.landscapeIntro },
              React.createElement(
                "div",
                { style: styles.landscapeIntroTop },
                React.createElement("div", {
                  style: mergeStyles(styles.landscapeIntroLine, {
                    backgroundColor: appColors.staticAccent5,
                  }),
                }),
                React.createElement(
                  "span",
                  {
                    style: mergeStyles(
                      appStyle.textSmall,
                      styles.landscapeEyebrow,
                      { color: appColors.staticCoolgray2 },
                    ),
                  },
                  (appData.projectsSubtitle ?? "").toUpperCase(),
                ),
                React.createElement(
                  "span",
                  {
                    style: mergeStyles(
                      appStyle.textExtraLarge,
                      styles.landscapeTitle,
                      { color: appColors.staticWhite },
                    ),
                  },
                  t(i18nKeys.screenTitleProjects),
                ),
              ),
              appData.projectsContext
                ? React.createElement(
                    "div",
                    {
                      style: mergeStyles(styles.landscapeIntroBox, {
                        backgroundColor: convertHexToRgba(
                          appColors.staticWhite,
                          0.2,
                        ),
                        borderColor: convertHexToRgba(
                          appColors.staticCoolgray8,
                          0.64,
                        ),
                      }),
                    },
                    React.createElement(
                      "span",
                      {
                        style: mergeStyles(
                          appStyle.textSmall,
                          styles.landscapeContext,
                          { color: appColors.staticWhite, opacity: 0.82 },
                        ),
                      },
                      appData.projectsContext,
                    ),
                  )
                : null,
              appData.projectsHighlights.length > 0
                ? React.createElement(
                    "div",
                    {
                      style: mergeStyles(styles.landscapeFeatureBox, {
                        backgroundColor: convertHexToRgba(
                          appColors.staticWhite,
                          0.14,
                        ),
                        borderColor: convertHexToRgba(
                          appColors.staticCoolgray8,
                          0.56,
                        ),
                      }),
                    },
                    appData.projectsHighlights.map((item, index) =>
                      React.createElement(
                        "div",
                        {
                          key: `${item.icon}-${item.text}-${index}`,
                          style: styles.landscapeFeatureItem,
                        },
                        React.createElement(
                          "div",
                          {
                            style: mergeStyles(
                              styles.landscapeFeatureIconWrap,
                              {
                                backgroundColor: convertHexToRgba(
                                  appColors.staticCoolgray8,
                                  0.42,
                                ),
                                borderColor: convertHexToRgba(
                                  appColors.staticWhite,
                                  0.16,
                                ),
                              },
                            ),
                          },
                          <WnaIcon
                            iconName={item.icon as never}
                            size={18}
                            color={appColors.staticWhite}
                          />,
                        ),
                        React.createElement(
                          "span",
                          {
                            style: mergeStyles(
                              appStyle.textSmall,
                              styles.landscapeFeatureText,
                              { color: appColors.staticWhite, opacity: 0.9 },
                            ),
                          },
                          item.text,
                        ),
                      ),
                    ),
                  )
                : null,
            ),
            React.createElement(
              "div",
              { style: styles.landscapeProjects },
              featuredProject
                ? renderProjectCard(featuredProject, 0, {
                    featured: true,
                    landscapeVariant: true,
                  })
                : null,
              gridProjects.length > 0
                ? React.createElement(
                    "div",
                    { style: styles.landscapeGrid },
                    gridProjectColumns.map((column, columnIndex) =>
                      React.createElement(
                        "div",
                        {
                          key: `projects-column-${columnIndex}`,
                          style: styles.landscapeGridColumn,
                        },
                        column.map((item) => {
                          const projectIndex = projects.findIndex(
                            (project) => project.title === item.title,
                          );

                          return React.createElement(
                            "div",
                            {
                              key: `${item.title}-${projectIndex}`,
                              style: styles.landscapeGridItem,
                            },
                            renderProjectCard(item, projectIndex, {
                              landscapeVariant: true,
                            }),
                          );
                        }),
                      ),
                    ),
                  )
                : null,
            ),
          ),
          React.createElement(
            "div",
            {
              style: mergeStyles(
                appStyle.containerCenterMaxWidth,
                styles.footerWrap,
              ),
            },
            <WnaContactFooter />,
          ),
        ),
      ),
    );
  }, [
    appColors,
    appData.projectsHighlights,
    appData.projectsContext,
    appData.projectsSubtitle,
    landscapeScrollContainerStyle,
    onScroll,
    scrollContainerRef,
    appStyle,
    featuredProject,
    gridProjectColumns,
    gridProjects.length,
    projects,
    renderProjectCard,
    t,
  ]);

  return (
    <WnaBaseScreen
      isRootPage
      headerTitle={t(i18nKeys.screenTitleProjects)}
      titleHref={getNavigationPath("root", lang)}
      scrollY={scrollY}
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
      {isLandscape
        ? renderLandscapeLayout
        : React.createElement(
            "div",
            {
              ref: scrollContainerRef,
              style: scrollContainerStyle,
              onScroll,
            },
            renderPortraitIntro,
            projects.map((item, index) => (
              <Fragment key={`${item.title}-${index}`}>
                {renderProjectCard(item, index)}
                {index < projects.length - 1 ? itemSeparator() : null}
              </Fragment>
            )),
            <WnaContactFooter />,
          )}
    </WnaBaseScreen>
  );
}
