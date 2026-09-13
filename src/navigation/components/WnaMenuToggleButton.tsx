import WnaButtonHeader from "@components/buttons/WnaButtonHeader";
import AppStyle from "@/theme/appStyle";
import Colors from "@constants/theme/colors";
import { DrawerActions } from "@react-navigation/native";
import { i18nKeys } from "@/i18n/i18nKeys";
import { TFunction } from "i18next";
import React, { CSSProperties, memo } from "react";

type DrawerNavigationDispatcher = {
  dispatch: (action: ReturnType<typeof DrawerActions.openDrawer>) => void;
};

export type WnaMenuToggleButtonProps = {
  appColors: Colors;
  appStyle: AppStyle;
  navigation: DrawerNavigationDispatcher;
  t: TFunction<string[], undefined>;
};

function WnaMenuToggleButton({
  appColors,
  appStyle,
  navigation,
  t,
}: WnaMenuToggleButtonProps) {
  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      } as CSSProperties,
    },
    <WnaButtonHeader
      appStyle={appStyle}
      appColors={appColors}
      text={t(i18nKeys.screenTitleMenu)}
      iconName="menu"
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      t={t}
      checkInternetConnection={false}
    />,
  );
}

export default memo(WnaMenuToggleButton);
