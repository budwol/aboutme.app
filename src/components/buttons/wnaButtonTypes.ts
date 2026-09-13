import Colors from "@constants/theme/colors";
import AppStyle from "@/theme/appStyle";
import { TFunction } from "i18next";
import { CSSProperties } from "react";

export type WnaButtonActionProps = {
  onPress: () => void;
  checkInternetConnection?: boolean;
  t?: TFunction<string[], undefined>;
  disabled?: boolean;
};

export type WnaButtonTextAppearanceProps = {
  text: string;
  textColor?: string;
  backgroundColor?: string;
  style?: CSSProperties | CSSProperties[];
};

export type WnaButtonThemeProps = {
  appColors: Colors;
  appStyle?: AppStyle;
};
