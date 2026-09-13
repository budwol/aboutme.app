import { appLayoutConstants } from "@constants/layoutConstants";
import { sectionConstants } from "@constants/sectionConstants";
import { convertHexToRgba } from "@utils/colorConverter";
import React, { FC, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { WnaSectionProps } from "@components/sections/wnaSectionProps";

type WnaFooterActionLinkProps = Pick<
  WnaSectionProps,
  "appColors" | "appStyle"
> & {
  label: string;
  onPress: () => void;
};

const styles = StyleSheet.create({
  footerActionRow: {
    alignItems: "center",
  },
  footerActionButtonText: {
    fontWeight: "600",
  },
});

const WnaFooterActionLink: FC<WnaFooterActionLinkProps> = ({
  appColors,
  appStyle,
  label,
  onPress,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const surfaceColor = useMemo(
    () => convertHexToRgba(appColors.accent5, 0.08),
    [appColors.accent5],
  );
  const borderColor = useMemo(
    () => convertHexToRgba(appColors.accent5, 0.25),
    [appColors.accent5],
  );
  const hoverBorderColor = useMemo(
    () => convertHexToRgba(appColors.accent5, 0.38),
    [appColors.accent5],
  );

  const buttonStyle = {
    appearance: "none" as const,
    alignItems: "center" as const,
    backgroundColor: isHovered
      ? convertHexToRgba(appColors.accent5, 0.14)
      : surfaceColor,
    borderRadius: appLayoutConstants.globalCornerRadius,
    borderWidth: 1,
    borderColor: isHovered ? hoverBorderColor : borderColor,
    borderStyle: "solid" as const,
    boxSizing: "border-box" as const,
    cursor: "pointer" as const,
    display: "flex" as const,
    fontFamily: "inherit",
    fontSize: "inherit",
    justifyContent: "center" as const,
    paddingBottom: sectionConstants.sectionFooterActionPaddingVertical,
    paddingLeft: sectionConstants.sectionFooterActionPaddingHorizontal,
    paddingRight: sectionConstants.sectionFooterActionPaddingHorizontal,
    paddingTop: sectionConstants.sectionFooterActionPaddingVertical,
  };

  return (
    <View style={styles.footerActionRow}>
      {React.createElement(
        "button",
        {
          type: "button",
          onClick: onPress,
          onMouseEnter: () => setIsHovered(true),
          onMouseLeave: () => setIsHovered(false),
          style: buttonStyle as React.CSSProperties,
        },
        <Text
          style={[
            appStyle.textMicro,
            styles.footerActionButtonText,
            { color: appColors.accent5 },
          ]}
        >
          {label} →
        </Text>,
      )}
    </View>
  );
};

export default WnaFooterActionLink;
