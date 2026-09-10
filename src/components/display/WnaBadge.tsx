import React, { memo } from "react";
import { Text, View, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import WnaIcon from "../icon/WnaIcon/WnaIcon";
import AppStyle from "@/theme/appStyle";
import Colors from "@constants/theme/colors";

export type WnaBadgeProps = {
  appColors: Colors;
  appStyle: AppStyle;
  style?: ViewStyle;
  textStyle?: TextStyle | TextStyle[];
  fontColor?: string;
  icon?: keyof typeof iconMap;
  text?: string;
};

const WnaBadge = ({
  appColors,
  appStyle,
  style,
  textStyle,
  fontColor,
  icon,
  text,
}: WnaBadgeProps) => {
  if (!icon && !text) return null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: appColors.warmgray6 },
        style,
      ]}
    >
      {icon && (
        <WnaIcon iconName={icon} size={13} color={appColors.coolgray8} />
      )}

      {text && (
        <Text
          style={
            Array.isArray(textStyle)
              ? [
                  appStyle.textMicro,
                  styles.text,
                  { color: fontColor ?? appColors.white },
                  ...textStyle,
                ]
              : [
                  appStyle.textMicro,
                  styles.text,
                  { color: fontColor ?? appColors.white },
                  textStyle ?? {},
                ]
          }
        >
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  text: {
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});

export default memo(WnaBadge);
