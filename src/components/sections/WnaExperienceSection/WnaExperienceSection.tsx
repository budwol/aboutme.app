import React, { useEffect, useMemo, useState } from "react";
import { DimensionValue, useWindowDimensions, View } from "react-native";
import WnaSectionTitle from "@components/text/WnaSectionTitle";
import WnaFooterActionLink from "@components/sections/WnaFooterActionLink";
import { i18nKeys } from "@/i18n/i18nKeys";
import { appLayoutConstants } from "@constants/layoutConstants";
import { convertHexToRgba } from "@utils/colorConverter";
import WnaExperienceTimelineItem from "./WnaExperienceTimelineItem";
import {
  compactBreakpoint,
  compactSidePadding,
  dotColumnWidth,
  maxCardWidth,
  minCardWidth,
  periodWidth,
  styles,
} from "./wnaExperienceSectionStyles";
import { WnaExperienceSectionProps } from "./wnaExperienceSectionTypes";

export default function WnaExperienceSection({
  appColors,
  appData,
  appStyle,
  t,
  maxItems,
  showDetails = true,
  expandAllDetailsByDefault = false,
  footerActionLabel,
  onFooterActionPress,
}: WnaExperienceSectionProps) {
  const { width } = useWindowDimensions();
  const isCompactLayout = width < compactBreakpoint;
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
  const accentBorderColor = useMemo(
    () => convertHexToRgba(appColors.accent5, 0.25),
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
        /* istanbul ignore next -- effectiveCardWidth is only undefined when isCompactLayout is true, but this branch only runs when it's false, so the fallback is unreachable within a single render */
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

  return (
    <View style={styles.container}>
      <WnaSectionTitle
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
            const isExpanded = expandedIndexes.includes(index);

            return (
              <WnaExperienceTimelineItem
                key={`${item.period}-${item.role}-${index}`}
                appColors={appColors}
                appStyle={appStyle}
                t={t}
                item={item}
                index={index}
                isCompactLayout={isCompactLayout}
                effectiveCardWidth={effectiveCardWidth}
                isExpanded={isExpanded}
                showDetails={showDetails}
                accentSurfaceColor={accentSurfaceColor}
                accentBorderColor={accentBorderColor}
                onToggleDetails={toggleExperienceDetails}
              />
            );
          })}
        </View>
      </View>

      {footerActionLabel && onFooterActionPress ? (
        <View style={styles.footerActionRow}>
          <WnaFooterActionLink
            appColors={appColors}
            appStyle={appStyle}
            label={footerActionLabel}
            onPress={onFooterActionPress}
          />
        </View>
      ) : null}
    </View>
  );
}
