import Colors from "@constants/theme/colors";
import AppStyle from "@services/wnaStyleService";

export type WnaBaseCardProps = {
  appColors: Colors;
  appStyle: AppStyle;
};

export type WnaVerticalTextCardContent = {
  title?: string;
  subtitle?: string;
  description?: string;
};
