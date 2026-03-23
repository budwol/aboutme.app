import { themePalettes } from "@constants/themePalettes";
import { appLayoutConstants } from "@constants/layoutConstants";
import { View } from "react-native";

export interface WnaSeparatorHorizontalProps {
  transparent?: boolean;
  space?: number;
  color?: string;
}

export default function WnaSeparatorHorizontal({
  transparent = false,
  color = themePalettes["light"].staticCoolgray3,
  space = appLayoutConstants.globalListGap,
}: WnaSeparatorHorizontalProps) {
  return (
    <View
      style={[
        {
          minHeight: 1,
          height: transparent ? 1 : 3,
          margin: space,
          minWidth: 128,
          width: 128,
          alignSelf: "center",
          backgroundColor: transparent ? "transparent" : color,
        },
      ]}
    />
  );
}
