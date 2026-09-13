import { themePalettes } from "@constants/theme/themePalettes";
import { appLayoutConstants } from "@constants/layoutConstants";

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
    <div
      aria-hidden="true"
      style={{
        minHeight: 1,
        height: transparent ? 1 : 3,
        margin: space,
        minWidth: 128,
        width: 128,
        alignSelf: "center",
        backgroundColor: transparent ? "transparent" : color,
      }}
    />
  );
}
