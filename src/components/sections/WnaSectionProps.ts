import Colors from "@constants/theme/colors";
import { AppData } from "@/app-data";
import { TFunction } from "i18next";
import AppStyle from "@/theme/appStyle";

export type WnaSectionProps = {
  appColors: Colors;
  appData: AppData;
  appStyle: AppStyle;
  t: TFunction<string[], undefined>;
};
