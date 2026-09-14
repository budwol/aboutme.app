import WnaButtonHeader from "@components/buttons/WnaButtonHeader";
import AppStyle from "@/theme/appStyle";
import Colors from "@constants/theme/colors";
import { useWnaAppLifecycle } from "@/state/WnaAppContext";
import { i18nKeys } from "@/i18n/i18nKeys";
import { TFunction } from "i18next";
import React, { CSSProperties, memo } from "react";

export type WnaMenuToggleButtonProps = {
  appColors: Colors;
  appStyle: AppStyle;
  t: TFunction<string[], undefined>;
};

function WnaMenuToggleButton({
  appColors,
  appStyle,
  t,
}: WnaMenuToggleButtonProps) {
  const { openDrawer } = useWnaAppLifecycle();

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
      onPress={openDrawer}
      t={t}
      checkInternetConnection={false}
    />,
  );
}

export default memo(WnaMenuToggleButton);
