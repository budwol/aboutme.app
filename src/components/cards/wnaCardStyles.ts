import { appLayoutConstants } from "@constants/layoutConstants";
import Colors from "@constants/theme/colors";
import { convertHexToRgba } from "@utils/colorConverter";
import { ViewStyle } from "react-native";

export type WnaCardGroupType = "first" | "last" | "middle" | "standalone";

export function getGroupedCardRadius(type: WnaCardGroupType): ViewStyle {
  return {
    borderTopLeftRadius:
      type === "first" || type === "standalone"
        ? appLayoutConstants.globalCornerRadius
        : 0,
    borderTopRightRadius:
      type === "first" || type === "standalone"
        ? appLayoutConstants.globalCornerRadius
        : 0,
    borderBottomLeftRadius:
      type === "last" || type === "standalone"
        ? appLayoutConstants.globalCornerRadius
        : 0,
    borderBottomRightRadius:
      type === "last" || type === "standalone"
        ? appLayoutConstants.globalCornerRadius
        : 0,
  };
}

export function getCardBorderStyle(appColors: Colors): ViewStyle {
  return {
    borderColor: convertHexToRgba(appColors.coolgray2, 0.5),
    borderWidth: 1,
  };
}
