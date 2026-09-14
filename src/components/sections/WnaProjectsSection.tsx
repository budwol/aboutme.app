import { useWnaLayout } from "@/state/WnaAppContext";
import WnaSectionTitle from "@components/text/WnaSectionTitle";
import WnaPressable from "@components/buttons/WnaPressable";
import WnaFooterActionLink from "@components/sections/WnaFooterActionLink";
import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import { getProjectImageForWidth } from "@components/images/wnaImageAssetResolver";
import { appLayoutConstants } from "@constants/layoutConstants";
import { sectionConstants } from "@constants/sectionConstants";
import { convertHexToRgba } from "@utils/colorConverter";
import { addToLineHeight } from "@utils/addToLineHeight";
import React, { CSSProperties } from "react";
import WnaCardVerticalImage from "@components/cards/WnaCardVerticalImage";
import { WnaSectionProps } from "@components/sections/wnaSectionProps";
import { i18nKeys } from "@/i18n/i18nKeys";

const styles = {
  footerActionWrap: {
    marginTop: sectionConstants.sectionFooterActionMarginTop,
  },
  projectItemFeatured: {
    width:
      sectionConstants.projectsCardWidth * 2 +
      sectionConstants.projectsCardGridGap,
  },
  highlightsWrap: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  highlightItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingInline: 12,
    paddingBlock: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "solid",
  },
} satisfies Record<string, CSSProperties>;

export type WnaProjectsSectionProps = WnaSectionProps & {
  onProjectPress?: (index: number) => void;
  onShowMorePress?: () => void;
};

export default function WnaProjectsSection({
  appColors,
  appData,
  appStyle,
  t,
  onProjectPress,
  onShowMorePress,
}: WnaProjectsSectionProps) {
  const { isLandscape } = useWnaLayout();
  const cardWidth = sectionConstants.projectsCardWidth;
  const cardHeight = cardWidth * 0.5;
  const cardContentMinHeight = 78;
  const featuredCardWidth =
    cardWidth * 2 + sectionConstants.projectsCardGridGap;
  const useFeaturedFirstCard = isLandscape;
  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: appLayoutConstants.contentSectionGap,
        paddingBlock: appLayoutConstants.contentSectionPaddingVertical,
      } as CSSProperties,
    },
    <WnaSectionTitle
      appColors={appColors}
      appStyle={appStyle}
      title={t(i18nKeys.screenTitleProjects)}
      subtitle={(appData.projectsSubtitle ?? "").toUpperCase()}
    />,
    appData.projectsContext
      ? React.createElement(
          "div",
          {
            style: {
              paddingInline: sectionConstants.projectsContextPaddingHorizontal,
              paddingBlock: sectionConstants.projectsContextPaddingVertical,
              borderWidth: 1,
              borderStyle: "solid",
              borderRadius: appLayoutConstants.globalCornerRadius,
              backgroundColor: convertHexToRgba(appColors.warmgray6, 0.16),
              borderColor: convertHexToRgba(appColors.coolgray2, 0.72),
            } as CSSProperties,
          },
          React.createElement(
            "span",
            {
              style: {
                ...appStyle.textSmall,
                fontStyle: "italic",
                fontWeight: "400",
                lineHeight: addToLineHeight(
                  appStyle.textSmall?.lineHeight,
                  4,
                  16,
                ),
                opacity: sectionConstants.projectsContextOpacity,
              } as CSSProperties,
            },
            appData.projectsContext,
          ),
        )
      : null,
    appData.projectsHighlights.length > 0
      ? React.createElement(
          "div",
          { style: styles.highlightsWrap },
          appData.projectsHighlights.map((item, index) =>
            React.createElement(
              "div",
              {
                key: `home-project-highlight-${item.icon}-${item.text}-${index}`,
                style: {
                  ...styles.highlightItem,
                  backgroundColor: convertHexToRgba(appColors.warmgray6, 0.2),
                  borderColor: convertHexToRgba(appColors.coolgray2, 0.5),
                } as CSSProperties,
              },
              <WnaIcon
                iconName={item.icon as never}
                size={16}
                color={appColors.black}
              />,
              React.createElement(
                "span",
                {
                  style: {
                    ...appStyle.textSmall,
                    color: appColors.black,
                  } as CSSProperties,
                },
                item.text,
              ),
            ),
          ),
        )
      : null,
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: sectionConstants.projectsCardGridGap,
        } as CSSProperties,
      },
      appData.projects.map((project, index) =>
        React.createElement(
          "div",
          {
            key: `${project.title}-${index}`,
            style: (index === 0 && useFeaturedFirstCard
              ? styles.projectItemFeatured
              : undefined) as CSSProperties,
          },
          <WnaPressable
            ripple={appColors.isDark ? "light" : "dark"}
            checkInternetConnection={false}
            accessibilityLabel={`Open project ${project.title}`}
            t={t}
            onPress={() => onProjectPress?.(index)}
          >
            <WnaCardVerticalImage
              contentMinHeight={cardContentMinHeight}
              height={cardHeight}
              width={
                index === 0 && useFeaturedFirstCard
                  ? featuredCardWidth
                  : cardWidth
              }
              appColors={appColors}
              appStyle={appStyle}
              imageUrl={`images/${getProjectImageForWidth(
                project,
                index === 0 && useFeaturedFirstCard
                  ? featuredCardWidth
                  : cardWidth,
              )}`}
              text1={project.title}
              text2={project.subtitle}
            />
          </WnaPressable>,
        ),
      ),
    ),
    onShowMorePress
      ? React.createElement(
          "div",
          { style: styles.footerActionWrap },
          <WnaFooterActionLink
            appColors={appColors}
            appStyle={appStyle}
            label={t(i18nKeys.actionShowMore)}
            onPress={onShowMorePress}
          />,
        )
      : null,
  );
}
