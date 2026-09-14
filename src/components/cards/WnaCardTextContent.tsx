import Colors from "@constants/theme/colors";
import AppStyle from "@/theme/appStyle";
import { lineClampStyle } from "@utils/lineClampStyle";
import { addToLineHeight } from "@utils/addToLineHeight";
import React, { CSSProperties, FC, memo, ReactNode } from "react";

export type WnaCardTextContentProps = {
  appColors: Colors;
  appStyle?: AppStyle;
  title?: string;
  subtitle?: string;
  subtitleContent?: ReactNode;
  description?: string;
  subtitleAlign?: "left" | "right" | "center" | "justify";
  subtitleMinHeight?: number;
  titleAlign?: "left" | "right" | "center" | "justify";
  titleMinHeight?: number;
  titlePaddingHorizontal?: number;
  titlePaddingTop?: number;
  bodyPadding?: number;
  subtitlePaddingHorizontal?: number;
  titleNumberOfLines?: number;
  subtitleNumberOfLines?: number;
};

const WnaCardTextContent: FC<WnaCardTextContentProps> = ({
  appColors,
  appStyle,
  title,
  subtitle,
  subtitleContent,
  description,
  subtitleAlign,
  subtitleMinHeight,
  titleAlign,
  titleMinHeight,
  titlePaddingHorizontal,
  titlePaddingTop,
  bodyPadding,
  subtitlePaddingHorizontal,
  titleNumberOfLines,
  subtitleNumberOfLines,
}) => (
  <>
    {title !== undefined
      ? React.createElement(
          "span",
          {
            style: {
              ...(appStyle
                ? appStyle.textNeutralMedium
                : {
                    color: appColors.black,
                    fontSize: 14,
                    fontWeight: "600",
                    lineHeight: "18px",
                  }),
              paddingInline: titlePaddingHorizontal ?? 0,
              paddingTop: titlePaddingTop ?? 0,
              lineHeight: appStyle
                ? addToLineHeight(appStyle.textNeutralMedium?.lineHeight, 2, 18)
                : "18px",
              minHeight: titleMinHeight,
              textAlign: titleAlign ?? "left",
              ...(titleNumberOfLines
                ? lineClampStyle(titleNumberOfLines)
                : undefined),
            } as CSSProperties,
          },
          title,
        )
      : null}

    {subtitleContent !== undefined
      ? React.createElement(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              minHeight: subtitleMinHeight,
              padding: bodyPadding ?? 0,
              paddingInline: subtitlePaddingHorizontal ?? bodyPadding ?? 0,
              alignItems:
                subtitleAlign === "center"
                  ? "center"
                  : subtitleAlign === "right"
                    ? "flex-end"
                    : "flex-start",
            } as CSSProperties,
          },
          subtitleContent,
        )
      : subtitle !== undefined
        ? React.createElement(
            "span",
            {
              style: {
                ...(appStyle
                  ? {
                      ...appStyle.textNeutralSmall,
                      padding: bodyPadding ?? 0,
                      lineHeight: addToLineHeight(
                        appStyle.textNeutralSmall?.lineHeight,
                        2,
                        16,
                      ),
                      paddingInline:
                        subtitlePaddingHorizontal ?? bodyPadding ?? 0,
                    }
                  : {
                      color: appColors.black,
                      fontSize: 13,
                      lineHeight: "16px",
                      paddingInline: subtitlePaddingHorizontal ?? 0,
                    }),
                minHeight: subtitleMinHeight,
                textAlign: subtitleAlign ?? "left",
                ...(subtitleNumberOfLines
                  ? lineClampStyle(subtitleNumberOfLines)
                  : undefined),
              } as CSSProperties,
            },
            subtitle,
          )
        : null}

    {!!description &&
      React.createElement(
        "span",
        {
          style: (appStyle?.textNeutralMicro ?? {
            color: appColors.black,
          }) as CSSProperties,
        },
        description,
      )}
  </>
);

WnaCardTextContent.displayName = "WnaCardTextContent";

export default memo(WnaCardTextContent);
