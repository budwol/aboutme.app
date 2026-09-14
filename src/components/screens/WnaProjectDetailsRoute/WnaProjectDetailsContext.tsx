import { convertHexToRgba } from "@utils/colorConverter";
import { addToLineHeight } from "@utils/addToLineHeight";
import React, { CSSProperties, ReactNode } from "react";
import { styles } from "./wnaProjectDetailsRouteStyles";
import type { WnaProjectDetailsThemeProps } from "./wnaProjectDetailsRouteTypes";

type WnaProjectDetailsContextProps = WnaProjectDetailsThemeProps & {
  context: string;
};

export default function WnaProjectDetailsContext({
  appColors,
  appStyle,
  context,
}: WnaProjectDetailsContextProps): ReactNode {
  return React.createElement(
    "div",
    {
      style: {
        ...styles.contextSection,
        backgroundColor: convertHexToRgba(appColors.warmgray6, 0.16),
        borderColor: convertHexToRgba(appColors.coolgray2, 0.72),
      } as CSSProperties,
    },
    React.createElement(
      "span",
      {
        style: {
          ...appStyle.textSmall,
          ...styles.projectContextText,
          lineHeight: addToLineHeight(appStyle.textSmall.lineHeight, 4, 16),
          opacity: 0.78,
        } as CSSProperties,
      },
      context,
    ),
  );
}
