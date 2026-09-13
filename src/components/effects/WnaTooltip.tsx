import { FontFamilies } from "@constants/theme/fontFamilies";
import { FC } from "react";
import { Text, TextStyle, View, ViewStyle } from "react-native";

export type WnaTooltipPosition = "top" | "right" | "bottom" | "left";

export type WnaTooltipProps = {
  content: string;
  position: WnaTooltipPosition;
  visible: boolean;
};

const positionStyles: Record<WnaTooltipPosition, ViewStyle> = {
  top: {
    alignItems: "center",
    bottom: "100%",
    left: 0,
    marginBottom: 4,
    right: 0,
  },
  right: {
    flexDirection: "row",
    justifyContent: "center",
    left: "100%",
    marginLeft: 4,
    top: 0,
    bottom: 0,
  },
  bottom: {
    alignItems: "center",
    left: 0,
    marginTop: 4,
    right: 0,
    top: "100%",
  },
  left: {
    flexDirection: "row",
    justifyContent: "center",
    marginRight: 4,
    right: "100%",
    top: 0,
    bottom: 0,
  },
};

const WnaTooltip: FC<WnaTooltipProps> = ({ content, position, visible }) => (
  <View
    accessibilityRole="text"
    pointerEvents="none"
    style={[
      positionStyles[position],
      styles.positioner,
      styles.fade,
      { opacity: visible ? 1 : 0 },
    ]}
  >
    {position === "bottom" && <View style={caretStyles[position]} />}
    {position === "right" && <View style={caretStyles[position]} />}
    <View style={styles.container}>
      <Text numberOfLines={1} style={styles.text}>
        {content}
      </Text>
    </View>
    {position === "top" && <View style={caretStyles[position]} />}
    {position === "left" && <View style={caretStyles[position]} />}
  </View>
);

const styles: {
  container: ViewStyle;
  fade: ViewStyle;
  positioner: ViewStyle;
  text: TextStyle;
} = {
  container: {
    backgroundColor: "#111",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    zIndex: 1000,
  },
  positioner: {
    position: "absolute",
    zIndex: 1000,
  },
  fade: {
    transition: "opacity 140ms ease-in-out",
  } as ViewStyle,
  text: {
    color: "#fff",
    fontFamily: FontFamilies.UI,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    textAlign: "center",
  },
};

const caretStyles: Record<WnaTooltipPosition, ViewStyle> = {
  top: {
    borderLeftColor: "transparent",
    borderLeftWidth: 6,
    borderRightColor: "transparent",
    borderRightWidth: 6,
    borderTopColor: "#111",
    borderTopWidth: 6,
    height: 0,
    width: 0,
  },
  right: {
    borderBottomColor: "transparent",
    borderBottomWidth: 6,
    borderLeftColor: "#111",
    borderLeftWidth: 6,
    borderTopColor: "transparent",
    borderTopWidth: 6,
    height: 0,
    width: 0,
  },
  bottom: {
    borderBottomColor: "#111",
    borderBottomWidth: 6,
    borderLeftColor: "transparent",
    borderLeftWidth: 6,
    borderRightColor: "transparent",
    borderRightWidth: 6,
    height: 0,
    width: 0,
  },
  left: {
    borderBottomColor: "transparent",
    borderBottomWidth: 6,
    borderRightColor: "#111",
    borderRightWidth: 6,
    borderTopColor: "transparent",
    borderTopWidth: 6,
    height: 0,
    width: 0,
  },
};

export default WnaTooltip;
