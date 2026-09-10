import React, { ReactNode } from "react";
import { Text, View } from "react-native";
import WnaBadge from "@components/display/WnaBadge";
import WnaCardSmallVertical from "@components/cards/WnaCardSmallVertical";
import { i18nKeys } from "@/i18n/i18nKeys";
import { convertHexToRgba } from "@utils/colorConverter";
import WnaExperienceCompanyLink from "./WnaExperienceCompanyLink";
import WnaExperienceDetailsBox from "./WnaExperienceDetailsBox";
import { styles } from "./styles";
import { WnaExperienceItem, WnaExperienceSharedProps } from "./types";

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
  return (
    <View
      style={[
        styles.detailCard,
        {
          backgroundColor,
        },
      ]}
    >
      <View
        style={[styles.detailMarker, { backgroundColor: appColors.accent5 }]}
      />
      <Text style={[appStyle.textNeutralMicro, styles.detailText]}>{text}</Text>
    </View>
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
  const detailsToggle = showDetails ? (
    <View style={styles.actionRow}>
      <View
        style={[
          styles.expandButton,
          {
            backgroundColor: accentSurfaceColor,
            borderColor: accentBorderColor,
          },
        ]}
      >
        <Text
          style={[
            appStyle.textMicro,
            styles.expandButtonText,
            { color: appColors.accent5 },
          ]}
        >
          {t(
            isExpanded
              ? i18nKeys.actionHideDetails
              : i18nKeys.actionShowDetails,
          )}
          {isExpanded ? " ↑" : " ↓"}
        </Text>
      </View>
    </View>
  ) : null;

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

  return (
    <View style={[styles.row, isCompactLayout && styles.rowCompact]}>
      {!isCompactLayout ? (
        <View style={styles.periodColumn}>
          <Text style={[appStyle.textNeutralSmall, styles.periodText]}>
            {item.period}
          </Text>
        </View>
      ) : null}

      <View
        style={[styles.dotColumn, isCompactLayout && styles.dotColumnCompact]}
      >
        <View
          style={[
            styles.dot,
            {
              backgroundColor: appColors.accent5,
              borderColor: appColors.accent5,
            },
          ]}
        />
      </View>

      <View
        style={[
          styles.cardColumn,
          effectiveCardWidth ? { width: effectiveCardWidth } : undefined,
          isCompactLayout && styles.cardColumnCompact,
        ]}
      >
        {isCompactLayout ? (
          <Text
            style={[
              appStyle.textNeutralSmall,
              styles.periodText,
              styles.periodTextCompact,
              {
                color: appColors.coolgray6,
              },
            ]}
          >
            {item.period}
          </Text>
        ) : null}
        <WnaCardSmallVertical
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
        />

        {showDetails && hasDetails ? (
          <WnaExperienceDetailsBox
            isExpanded={isExpanded}
            borderColor={appColors.coolgray2}
            backgroundColor={convertHexToRgba(appColors.coolgray1, 0.85)}
          >
            {descriptionDetail}
            {detailItems.length > 0 ? detailItems : null}

            {techBadges.length > 0 ? (
              <View style={styles.techSection}>
                <Text style={[appStyle.textNeutralLabel, styles.techLabel]}>
                  {t(i18nKeys.titleProjectTechstack)}
                </Text>
                <View style={styles.techList}>{techBadges}</View>
              </View>
            ) : null}
          </WnaExperienceDetailsBox>
        ) : null}
      </View>
    </View>
  );
}
