import {
  actionButtonRightConstants,
  appLayoutConstants,
} from "@constants/layoutConstants";
import Colors from "@constants/theme/colors";
import { convertHexToRgba } from "@utils/colorConverter";
import { CSSProperties } from "react";

export function createButtonTextContainerStyle(
  appColors: Colors,
  backgroundColor: string,
): CSSProperties {
  return {
    backgroundColor,
    borderColor: convertHexToRgba(appColors.coolgray2, 0.5),
    borderWidth: 1,
    borderStyle: "solid",
    height: actionButtonRightConstants.size,
    boxSizing: "border-box",
    borderRadius: appLayoutConstants.globalCornerRadius,
    overflow: "hidden",
    padding: 12,
  };
}

export function createButtonOutlineStyle(appColors: Colors): CSSProperties {
  return {
    outlineColor: convertHexToRgba(appColors.background, 0.5),
    outlineOffset: 2,
  };
}

export function createRoundIconButtonStyle(appColors: Colors): CSSProperties {
  const size = actionButtonRightConstants.size;

  return {
    height: size,
    width: size,
    boxSizing: "border-box",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: convertHexToRgba(appColors.coolgray2, 0.5),
    borderRadius: size / 2,
    backgroundColor: convertHexToRgba(appColors.staticBlack, 0.6),
    alignItems: "center",
    justifyContent: "center",
  };
}
