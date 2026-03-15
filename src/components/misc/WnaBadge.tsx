import React, { memo } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import WnaText from "@components/text/WnaText";
import WnaIcon from "../icon/WnaIcon/WnaIcon";
import AppStyle from "@services/wnaStyleService";
import Colors from "@constants/theme/colors";

export type WnaBadgeProps = {
  appColors: Colors;
  appStyle: AppStyle;
  style?: ViewStyle;
  icon?: keyof typeof iconMap;
  text?: string;
};

const WnaBadge = ({
  appColors,
  appStyle,
  style,
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
        <WnaText
          appColors={appColors}
          appStyle={appStyle}
          fontColor={appColors.white}
          style={styles.text}
          text={text}
        />
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
    gap: 4,
  },
  text: {
    fontSize: 13,
  },
});

export default memo(WnaBadge);
