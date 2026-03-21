import React, { useMemo, useState } from "react";
import {
  DimensionValue,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import WnaWelcomeTitle from "@components/text/WnaWelcomeTitle";
import WnaBadge from "@components/misc/WnaBadge";
import WnaCardSmallVertical from "../cards/WnaCardSmallVertical";
import { WnaWelcomeProps } from "@components/welcome/WnaWelcomeProps";
import { i18nKeys } from "@services/i18n/i18nKeys";
import { appLayoutConstants } from "@constants/layoutConstants";
import { convertHexToRgba } from "@utils/colorConverter";

const periodWidth = 128;
const dotColumnWidth = 18;
const cardWidth = 404;
const compactBreakpoint = 720;
const compactSidePadding = 8;

export default function WnaExperienceCard({
  appColors,
  appData,
  appStyle,
  t,
}: WnaWelcomeProps) {
  const { width } = useWindowDimensions();
  const isCompactLayout = width < compactBreakpoint;
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);

  const { timelineWidth, lineLeft } = useMemo(() => {
    let nextTimelineWidth: DimensionValue;
    let nextLineLeft: number;

    if (isCompactLayout) {
      nextTimelineWidth = "100%";
      nextLineLeft = compactSidePadding + dotColumnWidth / 2;
    } else {
      nextTimelineWidth =
        periodWidth +
        appLayoutConstants.globalListGap +
        dotColumnWidth +
        appLayoutConstants.globalListGap +
        cardWidth;
      nextLineLeft =
        periodWidth + appLayoutConstants.globalListGap + dotColumnWidth / 2;
    }

    return { timelineWidth: nextTimelineWidth, lineLeft: nextLineLeft };
  }, [isCompactLayout]);

  function toggleExperienceDetails(index: number) {
    setExpandedIndexes((current) =>
      current.includes(index)
        ? current.filter((entry) => entry !== index)
        : [...current, index],
    );
  }

  return (
    <View style={styles.container}>
      <WnaWelcomeTitle
        appColors={appColors}
        appStyle={appStyle}
        title={t(i18nKeys.screenTitleExperience)}
        subtitle={(appData.experienceSubtitle ?? "").toUpperCase()}
      />

      <View
        style={[
          styles.centerWrapper,
          isCompactLayout && styles.centerWrapperCompact,
        ]}
      >
        <View style={[styles.timelineWrapper, { width: timelineWidth }]}>
          <View
            style={[
              styles.timelineLine,
              {
                left: lineLeft,
                backgroundColor: appColors.coolgray6,
              },
              isCompactLayout && styles.timelineLineCompact,
            ]}
          />

          {appData.experience.map((item, index) => {
            const hasMore =
              item.details.length > 0 || item.techstack.length > 0;
            const isExpanded = expandedIndexes.includes(index);
            const detailItems = item.details.map((detail, detailIndex) => (
              <View
                key={`${detailIndex}-${detail}`}
                style={[
                  styles.detailCard,
                  {
                    backgroundColor: convertHexToRgba(appColors.accent5, 0.08),
                  },
                ]}
              >
                <View
                  style={[
                    styles.detailMarker,
                    { backgroundColor: appColors.accent5 },
                  ]}
                />
                <Text style={[appStyle.textNeutralMicro, styles.detailText]}>
                  {detail}
                </Text>
              </View>
            ));
            const techBadges = item.techstack.map((entry) => (
              <WnaBadge
                key={entry}
                text={entry}
                appColors={appColors}
                appStyle={appStyle}
              />
            ));

            return (
              <View
                key={`${item.period}-${item.role}-${index}`}
                style={[styles.row, isCompactLayout && styles.rowCompact]}
              >
                {!isCompactLayout ? (
                  <View style={styles.periodColumn}>
                    <Text
                      style={[appStyle.textNeutralSmall, styles.periodText]}
                    >
                      {item.period}
                    </Text>
                  </View>
                ) : null}

                <View
                  style={[
                    styles.dotColumn,
                    isCompactLayout && styles.dotColumnCompact,
                  ]}
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
                    description={item.description}
                    badgeText={item.duration || "..."}
                    opacity={item.opacity ?? 1}
                  />

                  {hasMore ? (
                    <Pressable
                      onPress={() => toggleExperienceDetails(index)}
                      style={[
                        styles.expandButton,
                        {
                          backgroundColor: convertHexToRgba(
                            appColors.accent5,
                            0.08,
                          ),
                          borderColor: convertHexToRgba(
                            appColors.accent5,
                            0.25,
                          ),
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
                    </Pressable>
                  ) : null}

                  {hasMore && isExpanded ? (
                    <View
                      style={[
                        styles.detailsBox,
                        {
                          borderColor: appColors.coolgray2,
                          backgroundColor: convertHexToRgba(
                            appColors.coolgray1,
                            0.85,
                          ),
                        },
                      ]}
                    >
                      {detailItems.length > 0 ? detailItems : null}

                      {techBadges.length > 0 ? (
                        <View style={styles.techSection}>
                          <Text
                            style={[
                              appStyle.textNeutralMicro,
                              styles.techLabel,
                              { color: appColors.coolgray6 },
                            ]}
                          >
                            {t(i18nKeys.titleProjectTechstack)}
                          </Text>
                          <View style={styles.techList}>{techBadges}</View>
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 24,
    paddingVertical: 16,
  },
  centerWrapper: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  centerWrapperCompact: {
    alignItems: "stretch",
    paddingHorizontal: 0,
  },
  timelineWrapper: {
    position: "relative",
    gap: 20,
  },
  timelineLineCompact: {
    left: compactSidePadding + dotColumnWidth / 2,
    top: 6,
    bottom: 6,
  },
  timelineLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    borderRadius: 2,
    opacity: 0.4,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: appLayoutConstants.globalListGap,
  },
  rowCompact: {
    gap: appLayoutConstants.globalListGap,
    paddingLeft: compactSidePadding,
  },
  periodColumn: {
    width: periodWidth,
  },
  periodText: {
    paddingVertical: 12,
  },
  periodTextCompact: {
    paddingTop: 0,
    paddingBottom: 10,
    lineHeight: 18,
  },
  dotColumn: {
    width: dotColumnWidth,
    alignItems: "center",
    paddingTop: 15,
  },
  dotColumnCompact: {
    paddingTop: 2,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    marginLeft: 2,
  },
  cardColumn: {
    width: cardWidth,
  },
  cardColumnCompact: {
    flex: 1,
    minWidth: 0,
    width: undefined,
  },
  expandButton: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  expandButtonText: {
    letterSpacing: 0.2,
  },
  detailsBox: {
    marginTop: 10,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderRadius: appLayoutConstants.globalCornerRadius,
    minWidth: 0,
  },
  detailCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    minWidth: 0,
    padding: 10,
    borderRadius: 12,
  },
  detailMarker: {
    width: 8,
    minWidth: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 5,
  },
  detailText: {
    flex: 1,
    minWidth: 0,
    lineHeight: 18,
  },
  techSection: {
    marginTop: 2,
    gap: 8,
  },
  techLabel: {
    lineHeight: 18,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  techList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    minWidth: 0,
  },
});
