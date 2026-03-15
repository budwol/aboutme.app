import React, { memo, useMemo } from "react";
import { Text, View, StyleSheet } from "react-native";

import WnaSeparatorHorizontal from "@components/misc/WnaSeparatorHorizontal";
import AppStyle from "@services/wnaStyleService";
import Colors from "@constants/theme/colors";

export interface WnaWelcomeTitleProps {
  appColors: Colors;
  appStyle: AppStyle;
  title: string;
  subtitle?: string;
  titleTextColor?: string;
}

const WnaWelcomeTitle = ({
  appColors,
  appStyle,
  title,
  subtitle,
  titleTextColor,
}: WnaWelcomeTitleProps) => {
  const titleStyle = useMemo(
    () => [
      appStyle.textTitleLarge,
      styles.title,
      { color: titleTextColor ?? appColors.black },
    ],
    [appStyle, titleTextColor, appColors.black],
  );

  const subtitleComponent = useMemo(() => {
    if (!subtitle) return null;

    return (
      <>
        <WnaSeparatorHorizontal transparent space={8} />
        <Text style={appStyle.textNeutralSubtitle}>{subtitle}</Text>
        <WnaSeparatorHorizontal transparent space={8} />
      </>
    );
  }, [subtitle, appStyle]);

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
  },
  title: {
    fontSize: 24,
    letterSpacing: 2,
  },
});

export default memo(WnaWelcomeTitle);
