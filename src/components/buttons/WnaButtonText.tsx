import { createButtonTextContainerStyle } from "@components/buttons/wnaButtonStyles";
import {
  WnaButtonActionProps,
  WnaButtonTextAppearanceProps,
  WnaButtonThemeProps,
} from "@components/buttons/wnaButtonTypes";
import { convertHexToRgba } from "@utils/colorConverter";
import { FC, memo } from "react";
import { Pressable, Text } from "react-native";

export type WnaButtonTextProps = WnaButtonThemeProps &
  Required<Pick<WnaButtonThemeProps, "appStyle">> &
  WnaButtonTextAppearanceProps &
  Required<Pick<WnaButtonActionProps, "onPress">> &
  Pick<WnaButtonActionProps, "checkInternetConnection" | "t">;

const WnaButtonTextComponent: FC<WnaButtonTextProps> = ({
  appColors,
  appStyle,
  text,
  textColor,
  backgroundColor,
  style,
  onPress,
}) => {
  const effectiveTextColor = textColor ?? appColors.staticWhite;
  const effectiveBackgroundColor =
    backgroundColor ?? convertHexToRgba(appColors.coolgray4, 0.5);

  return (
    <Pressable
      style={[
        createButtonTextContainerStyle(appColors, effectiveBackgroundColor),
        style,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          appStyle.textNeutralMedium,
          {
            color: effectiveTextColor,
            verticalAlign: "middle",
            textAlign: "center",
          },
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
};

const WnaButtonText = memo(WnaButtonTextComponent);

WnaButtonText.displayName = "WnaButtonText";

export default WnaButtonText;
