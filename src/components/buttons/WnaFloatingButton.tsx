import { iconMap } from "@components/icon/WnaIcon/WnaIconMap";
import { actionButtonRightConstants } from "@constants/layoutConstants";
import Colors from "@constants/theme/colors";
import AppStyle from "@services/wnaStyleService";
import { TFunction } from "i18next";
import { FC, memo } from "react";
import WnaButtonIcon from "./WnaButtonIcon";

export type WnaFloatingButtonIconProps = {
  appColors: Colors;
  appStyle: AppStyle;
  onPress?: () => void;
  t: TFunction<string[], undefined>;
  iconName?: keyof typeof iconMap;
  title: string;
  checkInternetConnection?: boolean;
};

const WnaFloatingButtonIconComponent: FC<WnaFloatingButtonIconProps> = ({
  appStyle,
  appColors,
  iconName,
  onPress,
  t,
  title,
  checkInternetConnection,
}) => (
  <WnaButtonIcon
    toolTip={title}
    toolTipPosition="left"
    appStyle={appStyle}
    appColors={appColors}
    iconName={iconName}
    style={{
      position: "absolute",
      bottom: actionButtonRightConstants.marginBottom,
      right: actionButtonRightConstants.marginRightPortrait,
      height: actionButtonRightConstants.size,
      width: actionButtonRightConstants.size,
      zIndex: 999,
      elevation: 999,
    }}
    onPress={() => onPress?.()}
    t={t}
    checkInternetConnection={checkInternetConnection ?? false}
  />
);

const WnaFloatingButtonIcon = memo(WnaFloatingButtonIconComponent);

WnaFloatingButtonIcon.displayName = "WnaFloatingButtonIcon";

export default WnaFloatingButtonIcon;
