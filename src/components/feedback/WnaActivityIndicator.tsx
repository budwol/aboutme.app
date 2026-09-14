import Colors from "@constants/theme/colors";
import React, { CSSProperties, memo } from "react";

export type WnaActivityIndicatorProps = {
  appColors: Colors;
  style?: CSSProperties;
};

function WnaActivityIndicator({ appColors, style }: WnaActivityIndicatorProps) {
  return React.createElement(
    "div",
    {
      role: "progressbar",
      "aria-label": "activity-indicator",
      className: "wna-activity-indicator",
      style: { ...style } as CSSProperties,
    },
    React.createElement("div", {
      style: {
        ...styles.spinner,
        borderTopColor: appColors.accent4,
        pointerEvents: "none",
      } as CSSProperties,
    }),
  );
}

const styles = {
  spinner: {
    width: 48,
    height: 48,
    borderWidth: 4,
    borderStyle: "solid",
    borderRadius: 999,
    borderColor: "rgba(128,128,128,0.24)",
  },
} satisfies Record<string, CSSProperties>;

export default memo(WnaActivityIndicator);
