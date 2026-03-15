import Colors from "@constants/theme/colors";
import AppStyle from "@services/wnaStyleService";
import { TFunction } from "i18next";
import { ViewStyle } from "react-native";

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
  style?: ViewStyle | ViewStyle[];
};

export type WnaButtonThemeProps = {
  appColors: Colors;
  appStyle?: AppStyle;
};
