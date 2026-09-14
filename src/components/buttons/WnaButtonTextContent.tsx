import AppStyle from "@/theme/appStyle";
import { FontFamilies } from "@constants/theme/fontFamilies";
import React, { CSSProperties, FC, memo, ReactNode } from "react";

export type WnaButtonTextContentProps = {
  appStyle?: AppStyle;
  text: string;
  textColor: string;
  textStyle?: CSSProperties;
  containerStyle?: CSSProperties;
  childrenLeft?: ReactNode;
};

const styles = {
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    marginInline: 16,
  },
  text: {
    fontWeight: "500",
    marginInline: 8,
    alignSelf: "center",
    letterSpacing: 0.5,
  },
  fallbackText: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: FontFamilies.UI,
  },
} satisfies Record<string, CSSProperties>;

const WnaButtonTextContent: FC<WnaButtonTextContentProps> = ({
  appStyle,
  text,
  textColor,
  textStyle,
  containerStyle,
  childrenLeft,
}) =>
  React.createElement(
    "div",
    {
      style: {
        ...styles.container,
        ...containerStyle,
      } as CSSProperties,
    },
    childrenLeft,
    React.createElement(
      "span",
      {
        style: {
          ...(appStyle?.textNeutralMedium ?? styles.fallbackText),
          ...styles.text,
          color: textColor,
          ...textStyle,
        } as CSSProperties,
      },
      text,
    ),
  );

WnaButtonTextContent.displayName = "WnaButtonTextContent";

export default memo(WnaButtonTextContent);
