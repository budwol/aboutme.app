import Colors from "@constants/theme/colors";
import { AppData } from "@/app-data";
import { TFunction } from "i18next";
import AppStyle from "@services/wnaStyleService";

export type WnaWelcomeProps = {
  appColors: Colors;
  appData: AppData;
  appStyle: AppStyle;
  t: TFunction<string[], undefined>;
};
