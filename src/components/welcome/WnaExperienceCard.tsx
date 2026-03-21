import React, { ReactNode, useEffect, useMemo, useState } from "react";
import {
  DimensionValue,
  LayoutChangeEvent,
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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const periodWidth = appLayoutConstants.experiencePeriodWidth;
const dotColumnWidth = appLayoutConstants.experienceDotColumnWidth;
const minCardWidth = appLayoutConstants.experienceMinCardWidth;
const maxCardWidth = appLayoutConstants.experienceMaxCardWidth;
const compactBreakpoint = appLayoutConstants.experienceCompactBreakpoint;
const compactSidePadding = appLayoutConstants.experienceCompactSidePadding;
const detailsTopSpacing = appLayoutConstants.experienceDetailsTopSpacing;
const detailsHeightBuffer = appLayoutConstants.experienceDetailsHeightBuffer;

type WnaExperienceCardProps = WnaWelcomeProps & {
  maxItems?: number;
  showDetails?: boolean;
  expandAllDetailsByDefault?: boolean;
  footerActionLabel?: string;
  onFooterActionPress?: () => void;
};

type ExperienceDetailsBoxProps = {
  isExpanded: boolean;
  backgroundColor: string;
  borderColor: string;
  children: ReactNode;
};

function ExperienceDetailsBox({
  isExpanded,
  backgroundColor,
  borderColor,
  children,
}: ExperienceDetailsBoxProps) {
  const [contentHeight, setContentHeight] = useState(0);
  const animatedHeight = useSharedValue(0);

  useEffect(() => {
    animatedHeight.value = withTiming(
      isExpanded ? contentHeight + detailsTopSpacing + detailsHeightBuffer : 0,
      {
        duration: 220,
      },
    );
  }, [animatedHeight, contentHeight, isExpanded]);

  function handleLayout(event: LayoutChangeEvent) {
    const nextHeight = event.nativeEvent.layout.height;

    if (nextHeight !== contentHeight) {
      setContentHeight(nextHeight);
    }
  }

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  return (
    <Animated.View style={[styles.detailsClip, animatedStyle]}>
      <View
        onLayout={handleLayout}
        style={[
          styles.detailsBox,
          {
            borderColor,
            backgroundColor,
          },
        ]}
      >
        {children}
      </View>
    </Animated.View>
  );
}

export default function WnaExperienceCard({
  appColors,
  appData,
  appStyle,
  t,
  maxItems,
  showDetails = true,
  expandAllDetailsByDefault = false,
  footerActionLabel,
  onFooterActionPress,
}: WnaExperienceCardProps) {
  const { width } = useWindowDimensions();
  const isCompactLayout = width < compactBreakpoint;
  const [hoveredDetailIndex, setHoveredDetailIndex] = useState<number | null>(
    null,
  );
  const [isFooterActionHovered, setIsFooterActionHovered] = useState(false);
  const experienceItems = useMemo(
    () => appData.experience.slice(0, maxItems ?? appData.experience.length),
    [appData.experience, maxItems],
  );
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>(() =>
    expandAllDetailsByDefault ? experienceItems.map((_, index) => index) : [],
  );

  useEffect(() => {
    setExpandedIndexes(
      expandAllDetailsByDefault ? experienceItems.map((_, index) => index) : [],
    );
  }, [expandAllDetailsByDefault, experienceItems]);

  const accentSurfaceColor = useMemo(
    () => convertHexToRgba(appColors.accent5, 0.08),
    [appColors.accent5],
  );
  const accentHoverSurfaceColor = useMemo(
    () => convertHexToRgba(appColors.accent5, 0.14),
    [appColors.accent5],
  );
  const accentBorderColor = useMemo(
    () => convertHexToRgba(appColors.accent5, 0.25),
    [appColors.accent5],
  );
  const accentHoverBorderColor = useMemo(
    () => convertHexToRgba(appColors.accent5, 0.38),
    [appColors.accent5],
  );
  const effectiveCardWidth = useMemo(() => {
    if (isCompactLayout) {
      return undefined;
    }

    const availableWidth = width - 320;
    return Math.min(maxCardWidth, Math.max(minCardWidth, availableWidth));
  }, [isCompactLayout, width]);

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
        (effectiveCardWidth ?? minCardWidth);
      nextLineLeft =
        periodWidth + appLayoutConstants.globalListGap + dotColumnWidth / 2;
    }

    return { timelineWidth: nextTimelineWidth, lineLeft: nextLineLeft };
  }, [effectiveCardWidth, isCompactLayout]);

  function toggleExperienceDetails(index: number) {
    setExpandedIndexes((current) =>
      current.includes(index)
        ? current.filter((entry) => entry !== index)
        : [...current, index],
    );
  }

  function setDetailsHover(index: number | null) {
    setHoveredDetailIndex(index);
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

          {experienceItems.map((item, index) => {
            const hasDescription = item.description.trim().length > 0;
            const hasExplicitDetails = item.details.length > 0;
            const hasDetails =
              hasExplicitDetails || item.techstack.length > 0 || hasDescription;
            const isExpanded = expandedIndexes.includes(index);
            const isDetailsHovered = hoveredDetailIndex === index;
            const descriptionDetail =
              hasDescription && !hasExplicitDetails ? (
                <View
                  style={[
                    styles.detailCard,
                    {
                      backgroundColor: accentSurfaceColor,
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
                    {item.description}
                  </Text>
                </View>
              ) : null;
            const detailItems = item.details.map((detail, detailIndex) => (
              <View
                key={`${detailIndex}-${detail}`}
                style={[
                  styles.detailCard,
                  {
                    backgroundColor: accentSurfaceColor,
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
            const detailsToggle =
              showDetails && hasDetails ? (
                <View style={styles.actionRow}>
                  <Pressable
                    onPress={() => toggleExperienceDetails(index)}
                    onHoverIn={() => setDetailsHover(index)}
                    onHoverOut={() => setDetailsHover(null)}
                    style={[
                      styles.expandButton,
                      {
                        backgroundColor: isDetailsHovered
                          ? accentHoverSurfaceColor
                          : accentSurfaceColor,
                        borderColor: isDetailsHovered
                          ? accentHoverBorderColor
                          : accentBorderColor,
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
                </View>
              ) : null;

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
                    effectiveCardWidth
                      ? { width: effectiveCardWidth }
                      : undefined,
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
                    footerContent={detailsToggle}
                  />

                  {showDetails && hasDetails ? (
                    <ExperienceDetailsBox
                      isExpanded={isExpanded}
                      borderColor={appColors.coolgray2}
                      backgroundColor={convertHexToRgba(
                        appColors.coolgray1,
                        0.85,
                      )}
                    >
                      {descriptionDetail}
                      {detailItems.length > 0 ? detailItems : null}

                      {techBadges.length > 0 ? (
                        <View style={styles.techSection}>
                          <Text
                            style={[
                              appStyle.textNeutralLabel,
                              styles.techLabel,
                            ]}
                          >
                            {t(i18nKeys.titleProjectTechstack)}
                          </Text>
                          <View style={styles.techList}>{techBadges}</View>
                        </View>
                      ) : null}
                    </ExperienceDetailsBox>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {footerActionLabel && onFooterActionPress ? (
        <View style={styles.footerActionRow}>
          <Pressable
            onPress={onFooterActionPress}
            onHoverIn={() => setIsFooterActionHovered(true)}
            onHoverOut={() => setIsFooterActionHovered(false)}
            style={[
              styles.footerActionButton,
              {
                borderColor: isFooterActionHovered
                  ? accentHoverBorderColor
                  : accentBorderColor,
                backgroundColor: isFooterActionHovered
                  ? accentHoverSurfaceColor
                  : accentSurfaceColor,
              },
            ]}
          >
            <Text
              style={[
                appStyle.textMicro,
                styles.footerActionButtonText,
                { color: appColors.accent5 },
              ]}
            >
              {footerActionLabel} →
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: appLayoutConstants.contentSectionGap,
    paddingVertical: appLayoutConstants.contentSectionPaddingVertical,
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
    width: minCardWidth,
  },
  cardColumnCompact: {
    flex: 1,
    minWidth: 0,
    width: undefined,
  },
  actionRow: {
    width: "100%",
    alignItems: "flex-end",
  },
  footerActionRow: {
    marginTop: 24,
    width: "100%",
    alignItems: "center",
  },
  expandButton: {
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
    marginTop: detailsTopSpacing,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderRadius: appLayoutConstants.globalCornerRadius,
    minWidth: 0,
  },
  detailsClip: {
    overflow: "hidden",
  },
  footerActionButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  footerActionButtonText: {
    letterSpacing: 0.2,
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
    opacity: 0.9,
  },
  techList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    minWidth: 0,
  },
});
