import {
  actionButtonRightConstants,
  appLayoutConstants,
} from "@constants/layoutConstants";
import Colors from "@constants/theme/colors";
import { convertHexToRgba } from "@utils/colorConverter";
import { ViewStyle } from "react-native";

export function createButtonTextContainerStyle(
  appColors: Colors,
  backgroundColor: string,
): ViewStyle {
  return {
    backgroundColor,
    borderColor: convertHexToRgba(appColors.coolgray2, 0.5),
    borderWidth: 1,
    height: actionButtonRightConstants.size,
    borderRadius: appLayoutConstants.globalCornerRadius,
    overflow: "hidden",
    padding: 12,
  };
}

export function createButtonOutlineStyle(appColors: Colors): ViewStyle {
  return {
    outlineColor: convertHexToRgba(appColors.background, 0.5),
    outlineOffset: 2,
  };
}

export function createRoundIconButtonStyle(appColors: Colors): ViewStyle {
  const size = actionButtonRightConstants.size;

  return {
    height: size,
    width: size,
    borderWidth: 1,
    borderColor: convertHexToRgba(appColors.coolgray2, 0.5),
    borderRadius: size / 2,
    backgroundColor: convertHexToRgba(appColors.staticBlack, 0.6),
    alignItems: "center",
    justifyContent: "center",
  };
}
