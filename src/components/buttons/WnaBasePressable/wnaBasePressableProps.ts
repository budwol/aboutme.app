import { TFunction } from "i18next";
import { CSSProperties, ReactNode } from "react";

export type WnaBasePressableProps = {
  children?: ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
  onHoverIn?: () => void;
  onHoverOut?: () => void;
  checkInternetConnection?: boolean;
  t?: TFunction<string[], undefined>;
  toolTip?: string;
  toolTipPosition?: "top" | "right" | "bottom" | "left";
  style?: CSSProperties | CSSProperties[];
  baseStyle?: CSSProperties | CSSProperties[];
  ripple?: "light" | "dark" | undefined;
  disableHover?: boolean;
  initialOpacity?: number;
  isEnabled?: boolean;
};
