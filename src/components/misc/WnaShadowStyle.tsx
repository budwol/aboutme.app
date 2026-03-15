import { convertHexToRgba } from "@utils/colorConverter";
import { ViewStyle } from "react-native";

export function WnaShadowStyle(
  opacity: number = 1,
  shadowColor: string = "#000000",
): ViewStyle {
  const destOpacity = opacity * 0.08;

  const offsetX = 0;
  const offsetY = 1;
  const blurRadius = 8;
  const rgbaShadow = shadowColor.startsWith("#")
    ? convertHexToRgba(shadowColor, destOpacity)
    : shadowColor;
  return {
    boxShadow: `${offsetX}px ${offsetY}px ${blurRadius}px ${rgbaShadow}`,
  };
}
