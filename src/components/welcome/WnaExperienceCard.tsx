import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import WnaWelcomeTitle from "@components/text/WnaWelcomeTitle";
import WnaCardSmallVertical from "../cards/WnaCardSmallVertical";
import { WnaWelcomeProps } from "@components/welcome/WnaWelcomeProps";
import { i18nKeys } from "@services/i18n/i18nKeys";

const PERIOD_WIDTH = 128;
const DOT_COLUMN_WIDTH = 18;
const GAP = 12;
const CARD_WIDTH = 404;

export default function WnaExperienceCard({
  appColors,
  appData,
  appStyle,
  t,
}: WnaWelcomeProps) {
  const { timelineWidth, lineLeft } = useMemo(() => {
    const timelineWidth =
      PERIOD_WIDTH + GAP + DOT_COLUMN_WIDTH + GAP + CARD_WIDTH;

    const lineLeft = PERIOD_WIDTH + GAP + DOT_COLUMN_WIDTH / 2;

    return { timelineWidth, lineLeft };
  }, []);

  return (
    <View style={styles.container}>
      <WnaWelcomeTitle
        appColors={appColors}
        appStyle={appStyle}
        title={t(i18nKeys.screenTitleExperience)}
        subtitle={(appData.experienceSubtitle ?? "").toUpperCase()}
      />

      <View style={styles.centerWrapper}>
        <View style={[styles.timelineWrapper, { width: timelineWidth }]}>
          {/* Timeline Vertical Line */}
          <View
            style={[
              styles.timelineLine,
              {
                left: lineLeft,
                backgroundColor: appColors.coolgray6,
              },
            ]}
          />

          {appData.experience.map((item, index) => (
            <View
              key={`${item.period}-${item.role}-${index}`}
              style={styles.row}
            >
              {/* Period */}
              <View style={styles.periodColumn}>
                <Text style={[appStyle.textNeutralSmall, styles.periodText]}>
                  {item.period}
                </Text>
              </View>

              {/* Dot */}
              <View style={[styles.dotColumn]}>
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
              <View style={styles.cardColumn}>
                <WnaCardSmallVertical
                  appStyle={appStyle}
                  appColors={appColors}
                  title={item.role}
                  subtitle={item.company}
                  description={item.description}
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
  timelineWrapper: {
    position: "relative",
    gap: 20,
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
    gap: GAP,
  },
  periodColumn: {
    width: PERIOD_WIDTH,
  },
  periodText: {
    paddingVertical: 12,
  },
  dotColumn: {
    width: DOT_COLUMN_WIDTH,
    alignItems: "center",
    paddingTop: 18,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    marginLeft: 2,
  },
  cardColumn: {
    width: CARD_WIDTH,
  },
});
