import WnaButtonTextContent from "@components/buttons/WnaButtonTextContent";
import WnaPressable from "@components/buttons/WnaPressable";
import { createButtonOutlineStyle } from "@components/buttons/wnaButtonStyles";
import {
  WnaButtonActionProps,
  WnaButtonTextAppearanceProps,
  WnaButtonThemeProps,
} from "@components/buttons/wnaButtonTypes";
import { actionButtonRightConstants } from "@constants/layoutConstants";
import { FC, memo } from "react";
import { StyleSheet } from "react-native";

export type WnaButtonTextV2Props = WnaButtonThemeProps &
  Required<Pick<WnaButtonThemeProps, "appStyle">> &
  WnaButtonTextAppearanceProps &
  Required<Pick<WnaButtonActionProps, "onPress">> &
  Pick<WnaButtonActionProps, "checkInternetConnection" | "t" | "disabled"> & {
    ripple: "light" | "dark";
  };

const WnaButtonTextV2Component: FC<WnaButtonTextV2Props> = ({
  appColors,
  appStyle,
  text,
  onPress,
  backgroundColor,
  textColor,
  style,
  ripple,
  disabled,
}) => {
  const effectiveTextColor = textColor ?? appColors.staticBlack;
  const effectiveBackgroundColor = backgroundColor ?? "transparent";
  const isDisabled = disabled ?? false;

  return (
    <WnaPressable
      disabled={isDisabled}
      ripple={ripple}
      style={[
        componentStyle.pressableContainer,
        {
          padding: 0,
          backgroundColor: effectiveBackgroundColor,
          borderColor: "transparent",
          borderWidth: 0,
          ...createButtonOutlineStyle(appColors),
        },
        isDisabled ? { opacity: 0.5 } : {},
        StyleSheet.flatten(style),
      ]}
      onPress={onPress}
    >
      <WnaButtonTextContent
        appStyle={appStyle}
        text={text}
        textColor={effectiveTextColor}
      />
    </WnaPressable>
  );
};

const componentStyle = StyleSheet.create({
  pressableContainer: {
    height: actionButtonRightConstants.size,
    borderRadius: 8,
    overflow: "hidden",
  },
});

const WnaButtonTextV2 = memo(WnaButtonTextV2Component);

WnaButtonTextV2.displayName = "WnaButtonTextV2";

export default WnaButtonTextV2;
