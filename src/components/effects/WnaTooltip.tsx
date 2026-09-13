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
    marginBottom: 8,
    right: 0,
  },
  right: {
    justifyContent: "center",
    left: "100%",
    marginLeft: 8,
    top: 0,
    bottom: 0,
  },
  bottom: {
    alignItems: "center",
    left: 0,
    marginTop: 8,
    right: 0,
    top: "100%",
  },
  left: {
    justifyContent: "center",
    marginRight: 8,
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
      { opacity: visible ? 1 : 0 },
    ]}
  >
    <View style={styles.container}>
      <Text numberOfLines={1} style={styles.text}>
        {content}
      </Text>
    </View>
  </View>
);

const styles: {
  container: ViewStyle;
  positioner: ViewStyle;
  text: TextStyle;
} = {
  container: {
    backgroundColor: "#111",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    position: "absolute",
    zIndex: 1000,
  },
  positioner: {
    position: "absolute",
    zIndex: 1000,
  },
  text: {
    color: "#fff",
    fontFamily: FontFamilies.UI,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    textAlign: "center",
  },
};

export default WnaTooltip;
