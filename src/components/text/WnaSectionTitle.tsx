import React, { memo, useMemo } from "react";
import { Text, View, StyleSheet } from "react-native";

import WnaSeparatorHorizontal from "@components/display/WnaSeparatorHorizontal";
import AppStyle from "@/theme/appStyle";
import Colors from "@constants/theme/colors";
import WnaAccentBar from "@components/display/WnaAccentBar";

export interface WnaSectionTitleProps {
  appColors: Colors;
  appStyle: AppStyle;
  title: string;
  subtitle?: string;
  titleTextColor?: string;
  showAccentBar?: boolean;
  accentBarWidth?: number;
  accentBarPulseToWidth?: number;
  accentBarPulseDuration?: number;
}

const WnaSectionTitle = ({
  appColors,
  appStyle,
  title,
  subtitle,
  titleTextColor,
  showAccentBar = false,
  accentBarWidth = 112,
  accentBarPulseToWidth,
  accentBarPulseDuration,
}: WnaSectionTitleProps) => {
  const titleStyle = useMemo(
    () => [
      appStyle.textExtraLarge,
      styles.title,
      { color: titleTextColor ?? appColors.black },
    ],
    [appStyle, titleTextColor, appColors.black],
  );

  const subtitleComponent = useMemo(() => {
    if (!subtitle) return null;

    return (
      <>
        <WnaSeparatorHorizontal transparent space={showAccentBar ? 10 : 8} />
        {showAccentBar ? (
          <WnaAccentBar
            appColors={appColors}
            width={accentBarWidth}
            pulseToWidth={accentBarPulseToWidth}
            pulseDuration={accentBarPulseDuration}
          />
        ) : null}
        {showAccentBar ? (
          <WnaSeparatorHorizontal transparent space={10} />
        ) : null}
        <Text style={appStyle.textNeutralSubtitle}>{subtitle}</Text>
        <WnaSeparatorHorizontal transparent space={8} />
      </>
    );
  }, [
    accentBarPulseDuration,
    accentBarPulseToWidth,
    accentBarWidth,
    appColors,
    appStyle,
    showAccentBar,
    subtitle,
  ]);

  return (
    <View style={styles.container}>
      <Text style={titleStyle}>{title}</Text>
      {subtitleComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    letterSpacing: 2,
    textAlign: "center",
  },
});

export default memo(WnaSectionTitle);
