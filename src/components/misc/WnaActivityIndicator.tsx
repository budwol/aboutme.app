import Colors from "@constants/theme/colors";
import { memo } from "react";
import { ActivityIndicator, ViewStyle } from "react-native";

export type WnaActivityIndicatorProps = {
  appColors: Colors;
  style?: ViewStyle;
};

function WnaActivityIndicator({ appColors, style }: WnaActivityIndicatorProps) {
  return (
    <ActivityIndicator
      size={48}
      style={[style]}
      color={appColors.accent4}
      aria-label={"activity-indicator"}
    />
  );
}

export default memo(WnaActivityIndicator);
