import { convertHexToRgba } from "@utils/colorConverter";
import { ReactNode } from "react";
import { Text, View } from "react-native";
import { styles } from "./styles";
import type { WnaProjectDetailsThemeProps } from "./types";

type WnaProjectDetailsContextProps = WnaProjectDetailsThemeProps & {
  context: string;
};

export default function WnaProjectDetailsContext({
  appColors,
  appStyle,
  context,
}: WnaProjectDetailsContextProps): ReactNode {
  return (
    <View
      style={[
        styles.contextSection,
        {
          backgroundColor: convertHexToRgba(appColors.warmgray6, 0.16),
          borderColor: convertHexToRgba(appColors.coolgray2, 0.72),
        },
      ]}
    >
      <Text
        style={[
          appStyle.textSmall,
          {
            ...styles.projectContextText,
            lineHeight: (appStyle.textSmall.lineHeight ?? 16) + 4,
            opacity: 0.78,
          },
        ]}
      >
        {context}
      </Text>
    </View>
  );
}
