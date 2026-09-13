import Colors from "@constants/theme/colors";
import { memo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

export type WnaActivityIndicatorProps = {
  appColors: Colors;
  style?: ViewStyle;
};

function WnaActivityIndicator({ appColors, style }: WnaActivityIndicatorProps) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="activity-indicator"
      {...{ className: "wna-activity-indicator" }}
      style={[style]}
    >
      <View
        style={[
          styles.spinner,
          { borderTopColor: appColors.accent4, pointerEvents: "none" },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  spinner: {
    width: 48,
    height: 48,
    borderWidth: 4,
    borderRadius: 999,
    borderColor: "rgba(128,128,128,0.24)",
  },
});

export default memo(WnaActivityIndicator);
