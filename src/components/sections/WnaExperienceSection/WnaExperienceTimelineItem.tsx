import React, { CSSProperties, ReactNode } from "react";
import WnaBadge from "@components/display/WnaBadge";
import WnaCardVerticalSmall from "@components/cards/WnaCardVerticalSmall";
import { i18nKeys } from "@/i18n/i18nKeys";
import { convertHexToRgba } from "@utils/colorConverter";
import WnaExperienceCompanyLink from "./WnaExperienceCompanyLink";
import WnaExperienceDetailsBox from "./WnaExperienceDetailsBox";
import { styles } from "./wnaExperienceSectionStyles";
import {
  WnaExperienceItem,
  WnaExperienceSharedProps,
} from "./wnaExperienceSectionTypes";

type WnaExperienceTimelineItemProps = WnaExperienceSharedProps & {
  item: WnaExperienceItem;
  index: number;
  isCompactLayout: boolean;
  effectiveCardWidth: number | undefined;
  isExpanded: boolean;
  showDetails: boolean;
  accentSurfaceColor: string;
  accentBorderColor: string;
  onToggleDetails: (index: number) => void;
};

function ExperienceDetailCard({
  appColors,
  appStyle,
  backgroundColor,
  text,
}: Pick<WnaExperienceSharedProps, "appColors" | "appStyle"> & {
  backgroundColor: string;
  text: string;
}) {
  return React.createElement(
    "div",
    {
      style: {
        ...styles.detailCard,
        backgroundColor,
      } as CSSProperties,
    },
    React.createElement("div", {
      style: {
        ...styles.detailMarker,
        backgroundColor: appColors.accent5,
      } as CSSProperties,
    }),
    React.createElement(
      "span",
      {
        style: {
          ...appStyle.textNeutralMicro,
          ...styles.detailText,
        } as CSSProperties,
      },
      text,
    ),
  );
}

export default function WnaExperienceTimelineItem({
  appColors,
  appStyle,
  t,
  item,
  index,
  isCompactLayout,
  effectiveCardWidth,
  isExpanded,
  showDetails,
  accentSurfaceColor,
  accentBorderColor,
  onToggleDetails,
}: WnaExperienceTimelineItemProps) {
  const hasDescription = item.description.trim().length > 0;
  const hasExplicitDetails = item.details.length > 0;
  const hasDetails =
    hasExplicitDetails || item.techstack.length > 0 || hasDescription;
  const descriptionDetail =
    hasDescription && !hasExplicitDetails ? (
      <ExperienceDetailCard
        appColors={appColors}
        appStyle={appStyle}
        backgroundColor={accentSurfaceColor}
        text={item.description}
      />
    ) : null;
  const detailItems = item.details.map((detail, detailIndex) => (
    <ExperienceDetailCard
      key={`${detailIndex}-${detail}`}
      appColors={appColors}
      appStyle={appStyle}
      backgroundColor={accentSurfaceColor}
      text={detail}
    />
  ));
  const techBadges = item.techstack.map((entry) => (
    <WnaBadge
      key={entry}
      text={entry}
      appColors={appColors}
      appStyle={appStyle}
    />
  ));
  const detailsToggle = showDetails
    ? React.createElement(
        "div",
        { style: styles.actionRow as CSSProperties },
        React.createElement(
          "div",
          {
            style: {
              ...styles.expandButton,
              backgroundColor: accentSurfaceColor,
              borderColor: accentBorderColor,
            } as CSSProperties,
          },
          React.createElement(
            "span",
            {
              style: {
                ...appStyle.textMicro,
                ...styles.expandButtonText,
                color: appColors.accent5,
              } as CSSProperties,
            },
            t(
              isExpanded
                ? i18nKeys.actionHideDetails
                : i18nKeys.actionShowDetails,
            ),
            isExpanded ? " ↑" : " ↓",
          ),
        ),
      )
    : null;

  function renderCompanySubtitle(): ReactNode | undefined {
    if (!item.companyUrl) {
      return undefined;
    }

    return (
      <WnaExperienceCompanyLink
        appColors={appColors}
        appStyle={appStyle}
        company={item.company}
        companyUrl={item.companyUrl}
        index={index}
      />
    );
  }

  return React.createElement(
    "div",
    {
      style: {
        ...styles.row,
        ...(isCompactLayout ? styles.rowCompact : null),
      } as CSSProperties,
    },
    !isCompactLayout
      ? React.createElement(
          "div",
          { style: styles.periodColumn as CSSProperties },
          React.createElement(
            "span",
            {
              style: {
                ...appStyle.textNeutralSmall,
                ...styles.periodText,
              } as CSSProperties,
            },
            item.period,
          ),
        )
      : null,
    React.createElement(
      "div",
      {
        style: {
          ...styles.dotColumn,
          ...(isCompactLayout ? styles.dotColumnCompact : null),
        } as CSSProperties,
      },
      React.createElement("div", {
        style: {
          ...styles.dot,
          backgroundColor: appColors.accent5,
          borderColor: appColors.accent5,
        } as CSSProperties,
      }),
    ),
    React.createElement(
      "div",
      {
        style: {
          ...styles.cardColumn,
          ...(effectiveCardWidth ? { width: effectiveCardWidth } : null),
          ...(isCompactLayout ? styles.cardColumnCompact : null),
        } as CSSProperties,
      },
      isCompactLayout
        ? React.createElement(
            "span",
            {
              style: {
                ...appStyle.textNeutralSmall,
                ...styles.periodText,
                ...styles.periodTextCompact,
                color: appColors.coolgray6,
              } as CSSProperties,
            },
            item.period,
          )
        : null,
      <WnaCardVerticalSmall
        appStyle={appStyle}
        appColors={appColors}
        title={item.role}
        subtitle={item.company}
        subtitleContent={renderCompanySubtitle()}
        description={item.description}
        badgeText={item.duration || "..."}
        opacity={item.opacity ?? 1}
        footerContent={detailsToggle}
        onPress={showDetails ? () => onToggleDetails(index) : undefined}
      />,
      showDetails && hasDetails ? (
        <WnaExperienceDetailsBox
          isExpanded={isExpanded}
          borderColor={appColors.coolgray2}
          backgroundColor={convertHexToRgba(appColors.coolgray1, 0.85)}
        >
          {descriptionDetail}
          {detailItems.length > 0 ? detailItems : null}
          {techBadges.length > 0
            ? React.createElement(
                "div",
                { style: styles.techSection as CSSProperties },
                React.createElement(
                  "span",
                  {
                    style: {
                      ...appStyle.textNeutralLabel,
                      ...styles.techLabel,
                    } as CSSProperties,
                  },
                  t(i18nKeys.titleProjectTechstack),
                ),
                React.createElement(
                  "div",
                  { style: styles.techList as CSSProperties },
                  techBadges,
                ),
              )
            : null}
        </WnaExperienceDetailsBox>
      ) : null,
    ),
  );
}
