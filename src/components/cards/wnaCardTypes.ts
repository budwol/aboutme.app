import Colors from "@constants/theme/colors";
import AppStyle from "@/theme/appStyle";

export type WnaBaseCardProps = {
  appColors: Colors;
  appStyle: AppStyle;
};

export type WnaVerticalTextCardContent = {
  title?: string;
  subtitle?: string;
  description?: string;
};
