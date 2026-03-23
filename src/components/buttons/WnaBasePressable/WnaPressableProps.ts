import { TFunction } from "i18next";
import { ReactNode } from "react";
import { ViewStyle } from "react-native";

export type WnaPressableProps = {
  children?: ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
  onHoverIn?: () => void;
  onHoverOut?: () => void;
  checkInternetConnection?: boolean;
  t?: TFunction<string[], undefined>;
  toolTip?: string;
  toolTipPosition?: "top" | "right" | "bottom" | "left";
  style?: ViewStyle | ViewStyle[];
  baseStyle?: ViewStyle | ViewStyle[];
  ripple?: "light" | "dark" | undefined;
  disableHover?: boolean;
  initialOpacity?: number;
  isEnabled?: boolean;
};
