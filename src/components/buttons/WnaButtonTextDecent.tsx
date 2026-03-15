import {
  WnaButtonActionProps,
  WnaButtonTextAppearanceProps,
  WnaButtonThemeProps,
} from "@components/buttons/wnaButtonTypes";
import { FC, memo } from "react";
import { Pressable, Text, View } from "react-native";

export type WnaButtonTextDecentProps = WnaButtonThemeProps &
  WnaButtonTextAppearanceProps &
  Required<Pick<WnaButtonActionProps, "onPress">> &
  Pick<WnaButtonActionProps, "checkInternetConnection" | "t"> & {
    textColor?: string;
    textDecorationLine?: "underline" | "line-through" | "none";
    fontSize?: number;
  };

const WnaButtonTextDecentComponent: FC<WnaButtonTextDecentProps> = ({
  appColors,
  text,
  textColor,
  textDecorationLine,
  style,
  fontSize,
  onPress,
}) => {
  const effectiveTextColor = textColor ?? appColors.black;

  return (
    <View style={[style, { overflow: "hidden" }]}>
      <Pressable
        onPress={() => onPress()}
        onHoverIn={() => {}}
        onHoverOut={() => {}}
        style={style}
      >
        <Text
          style={{
            color: effectiveTextColor,
            fontSize: fontSize ?? 18,
            textDecorationLine: textDecorationLine ?? "none",
            paddingVertical: 8,
          }}
        >
          {text}
        </Text>
      </Pressable>
    </View>
  );
};

const WnaButtonTextDecent = memo(WnaButtonTextDecentComponent);

WnaButtonTextDecent.displayName = "WnaButtonTextDecent";

export default WnaButtonTextDecent;
