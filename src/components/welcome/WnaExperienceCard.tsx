import React, { useMemo } from "react";
import {
  DimensionValue,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import WnaWelcomeTitle from "@components/text/WnaWelcomeTitle";
import WnaCardSmallVertical from "../cards/WnaCardSmallVertical";
import { WnaWelcomeProps } from "@components/welcome/WnaWelcomeProps";
import { i18nKeys } from "@services/i18n/i18nKeys";
import { appLayoutConstants } from "@constants/layoutConstants";

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
          {/* Timeline Vertical Line */}
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

          {appData.experience.map((item, index) => (
            <View
              key={`${item.period}-${item.role}-${index}`}
              style={[styles.row, isCompactLayout && styles.rowCompact]}
            >
              {!isCompactLayout ? (
                <View style={styles.periodColumn}>
                  <Text style={[appStyle.textNeutralSmall, styles.periodText]}>
                    {item.period}
                  </Text>
                </View>
              ) : null}

              {/* Dot */}
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

              {/* Card */}
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
              </View>
            </View>
          ))}
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
});
