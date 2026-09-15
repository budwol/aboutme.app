import { FontFamilies } from "@constants/theme/fontFamilies";
import { lineClampStyle } from "@utils/lineClampStyle";
import React, { CSSProperties, FC } from "react";

export type WnaTooltipPosition = "top" | "right" | "bottom" | "left";

export type WnaTooltipProps = {
  content: string;
  position: WnaTooltipPosition;
  visible: boolean;
};

// Centers the bubble+caret group on both axes, independent of whichever
// flexDirection a given position below uses (see positionStyles).
const centered: CSSProperties = {
  alignItems: "center",
  justifyContent: "center",
};

const positionStyles: Record<WnaTooltipPosition, CSSProperties> = {
  // top/bottom stack the bubble and its caret vertically (one above the
  // other), so this container needs flexDirection "column" -- the caret
  // is a row-sibling of the bubble in the DOM either way, and without an
  // explicit column direction it renders beside the bubble instead of
  // pointing at the anchor above/below it.
  top: {
    ...centered,
    flexDirection: "column",
    bottom: "100%",
    left: 0,
    marginBottom: 4,
    right: 0,
  },
  bottom: {
    ...centered,
    flexDirection: "column",
    left: 0,
    marginTop: 4,
    right: 0,
    top: "100%",
  },
  // right/left place the bubble and its caret side by side, so this
  // stays row (flexbox's own default, kept explicit for symmetry with
  // top/bottom above).
  right: {
    ...centered,
    flexDirection: "row",
    left: "100%",
    marginLeft: 4,
    top: 0,
    bottom: 0,
  },
  left: {
    ...centered,
    flexDirection: "row",
    marginRight: 4,
    right: "100%",
    top: 0,
    bottom: 0,
  },
};

const WnaTooltip: FC<WnaTooltipProps> = ({ content, position, visible }) =>
  React.createElement(
    "div",
    {
      role: "tooltip",
      style: {
        display: "flex",
        ...positionStyles[position],
        ...styles.positioner,
        ...styles.fade,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
      } as CSSProperties,
    },
    (position === "bottom" || position === "right") &&
      React.createElement("div", { style: caretStyles[position] }),
    React.createElement(
      "div",
      { style: styles.container },
      React.createElement(
        "span",
        { style: { ...styles.text, ...lineClampStyle(1) } as CSSProperties },
        content,
      ),
    ),
    (position === "top" || position === "left") &&
      React.createElement("div", { style: caretStyles[position] }),
  );

const styles: {
  container: CSSProperties;
  fade: CSSProperties;
  positioner: CSSProperties;
  text: CSSProperties;
} = {
  container: {
    position: "relative",
    backgroundColor: "#111",
    borderRadius: 4,
    paddingInline: 8,
    paddingBlock: 6,
    zIndex: 1000,
  },
  positioner: {
    position: "absolute",
    zIndex: 1000,
  },
  fade: {
    transition: "opacity 140ms ease-in-out",
  },
  text: {
    color: "#fff",
    fontFamily: FontFamilies.UI,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: "16px",
    textAlign: "center",
  },
};

const caretStyles: Record<WnaTooltipPosition, CSSProperties> = {
  top: {
    borderLeftColor: "transparent",
    borderLeftWidth: 6,
    borderRightColor: "transparent",
    borderRightWidth: 6,
    borderTopColor: "#111",
    borderTopWidth: 6,
    borderStyle: "solid",
    height: 0,
    width: 0,
  },
  right: {
    borderBottomColor: "transparent",
    borderBottomWidth: 6,
    borderLeftColor: "#111",
    borderLeftWidth: 6,
    borderTopColor: "transparent",
    borderTopWidth: 6,
    borderStyle: "solid",
    height: 0,
    width: 0,
  },
  bottom: {
    borderBottomColor: "#111",
    borderBottomWidth: 6,
    borderLeftColor: "transparent",
    borderLeftWidth: 6,
    borderRightColor: "transparent",
    borderRightWidth: 6,
    borderStyle: "solid",
    height: 0,
    width: 0,
  },
  left: {
    borderBottomColor: "transparent",
    borderBottomWidth: 6,
    borderRightColor: "#111",
    borderRightWidth: 6,
    borderTopColor: "transparent",
    borderTopWidth: 6,
    borderStyle: "solid",
    height: 0,
    width: 0,
  },
};

export default WnaTooltip;
