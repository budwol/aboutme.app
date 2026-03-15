import { appLayoutConstants } from "@constants/layoutConstants";
import Colors from "@constants/theme/colors";
import { convertHexToRgba } from "@utils/colorConverter";
import { ViewStyle } from "react-native";

export function createVerticalCardContainerStyle(
  appColors: Colors,
  opacity?: number,
): ViewStyle {
  return {
    backgroundColor: convertHexToRgba(appColors.warmgray6, 0.2),
    borderRadius: appLayoutConstants.globalCornerRadius,
    borderWidth: 1,
    borderColor: convertHexToRgba(appColors.coolgray2, 0.5),
    overflow: "hidden",
    opacity,
  };
}
