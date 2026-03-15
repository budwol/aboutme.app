import React, { FC, memo, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { TFunction } from "i18next";

import WnaIcon from "@components/icon/WnaIcon/WnaIcon";
import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import { appLayoutConstants } from "@constants/layoutConstants";
import AppStyle from "@services/wnaStyleService";
import Colors from "@constants/theme/colors";
import { convertHexToRgba } from "@utils/colorConverter";
import WnaPressable from "./WnaPressable";

export type WnaButtonHeaderProps = {
  appColors: Colors;
  appStyle: AppStyle;
  iconName: keyof typeof iconMap;
  text?: string;
  color?: string;
  onPress: () => void;
  checkInternetConnection?: boolean;
  t?: TFunction<string[], undefined>;
  badgeVisible?: boolean;
};

const WnaButtonHeader: FC<WnaButtonHeaderProps> = ({
  appColors,
  appStyle,
  iconName,
  text = "",
  color,
  onPress,
  checkInternetConnection = false,
  t,
  badgeVisible = false,
}) => {
  const size = appLayoutConstants.headerButtonHeight;
  const iconSize = 20;

  const resolvedColor = color || appColors.staticWhite;

  const outlineColor = useMemo(
    () => convertHexToRgba(appColors.staticWhite, 0.5),
    [appColors.staticWhite],
  );

  return (
    <View style={styles.wrapper}>
      <WnaPressable
        toolTip={text}
        toolTipPosition="bottom"
        style={[
          styles.pressable,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            outlineColor,
          },
        ]}
        onPress={onPress}
        checkInternetConnection={checkInternetConnection}
        t={t}
        ripple="light"
      >
        <View
          style={[
            appStyle.containerCenterCenter,
            styles.inner,
            { width: size, height: size },
          ]}
        >
          <WnaIcon iconName={iconName} size={iconSize} color={resolvedColor} />

          {badgeVisible && (
            <View style={[styles.badge, { backgroundColor: appColors.red3 }]} />
          )}
        </View>
      </WnaPressable>
    </View>
  );
};

export default memo(WnaButtonHeader);

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  pressable: {
    outlineOffset: 2,
  },
  inner: {
    backgroundColor: "transparent",
  },
  badge: {
    height: 8,
    width: 8,
    borderRadius: 4,
    position: "absolute",
    top: 14,
    right: 14,
  },
});
