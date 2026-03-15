import React, { memo, useMemo } from "react";
import { Text, View, StyleSheet } from "react-native";
import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import AppStyle from "@services/wnaStyleService";
import Colors from "@constants/theme/colors";

export type WnaTextWithIconProps = {
  appStyle: AppStyle;
  appColors: Colors;
  iconName: keyof typeof iconMap;
  iconColor?: string;
  iconRotation?: number;
  text: string;
  textColor?: string;
  iconSize?: number;
  postfix?: string;
  postfixColor?: string;
  width?: number;
};

const lineSize = 24;
const defaultIconSize = 18;

const WnaTextWithIcon = ({
  appStyle,
  appColors,
  iconName,
  iconColor,
  iconRotation = 0,
  text,
  textColor,
  iconSize = defaultIconSize,
  postfix,
  postfixColor,
  width,
}: WnaTextWithIconProps) => {
  const resolvedIconColor = iconColor ?? appColors.black;
  const resolvedTextColor = textColor ?? appColors.black;
  const resolvedPostfixColor = postfixColor ?? appColors.black;

  const rotationStyle = useMemo(
    () => ({
      transform: [{ rotate: `${iconRotation}deg` }],
    }),
    [iconRotation],
  );

  const containerStyle = useMemo(
    () => [styles.container, width ? { width } : undefined],
    [width],
  );

  return (
    <View style={containerStyle}>
      <View style={styles.iconWrapper}>
        <View style={rotationStyle}>
          <WnaIcon
            iconName={iconName}
            size={iconSize}
            color={resolvedIconColor}
          />
        </View>
      </View>

      <View style={styles.textWrapper}>
        <Text
          style={[appStyle.textNeutralMedium, { color: resolvedTextColor }]}
          numberOfLines={1}
        >
          {text}
        </Text>
      </View>

      {postfix ? (
        <View style={styles.textWrapper}>
          <Text
            style={[
              appStyle.textNeutralMedium,
              { color: resolvedPostfixColor },
            ]}
            numberOfLines={1}
          >
            {postfix}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    height: lineSize,
    overflow: "hidden",
  },
  iconWrapper: {
    width: lineSize,
    height: lineSize,
    justifyContent: "center",
    alignItems: "center",
  },
  textWrapper: {
    alignSelf: "center",
    height: lineSize,
    justifyContent: "center",
  },
});

export default memo(WnaTextWithIcon);
