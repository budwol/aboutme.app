import AppStyle from "@services/wnaStyleService";
import Colors from "@constants/theme/colors";

export type WnaHyperLinkTextProps = {
  appStyle: AppStyle;
  appColors: Colors;
  text: string;
  onHyperLinkClick: () => void;
  isExternal?: boolean;
  bold?: boolean;
  textTransform?: "uppercase" | "none";
};

export type WnaHyperLinkTextState = {
  hover: boolean;
  active: boolean;
};
