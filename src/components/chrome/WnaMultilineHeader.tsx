import { cleanAndTruncate } from "@utils/cleanAndTruncate";
import { AppLayout } from "@constants/layoutConstants";
import AppStyle from "@/theme/appStyle";
import Colors from "@constants/theme/colors";
import { convertHexToRgba } from "@utils/colorConverter";
import { lineClampStyle } from "@utils/lineClampStyle";
import React, { CSSProperties } from "react";
import WnaPressable from "@components/buttons/WnaPressable";
import WnaImage from "@components/images/WnaImage";

export default function WnaMultilineHeader(
  appColors: Colors,
  appStyle: AppStyle,
  appLayout: AppLayout,
  isTabRoot: boolean,
  isLandscape: boolean,
  headerTitle?: string,
  onPress: () => void = () => {},
) {
  if (!headerTitle) return null;

  const title = headerTitle;
  const maxLength = 4096;
  let mainTitle = "";
  let subTitle = "";
  // istanbul ignore else -- title is guaranteed truthy here because the
  // `!headerTitle` guard above already returned for any falsy value.
  if (title) {
    const titleSegments = title.split("|");
    if (titleSegments.length > 1) {
      mainTitle = cleanAndTruncate(titleSegments[0].trim(), maxLength);
      subTitle = cleanAndTruncate(titleSegments[1].trim(), maxLength);
    } else {
      mainTitle = cleanAndTruncate(title.trim(), maxLength);
    }
  }

  const showLogo = isTabRoot;
  const logoSize = 32;
  const altText = "logo";
  let logoCornerRadius = logoSize / 2;
  const textStyle = styles(appColors).text;

  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        flexShrink: 1,
        minWidth: 0,
        height: appLayout.headerHeight,
        justifyContent: "center",
      } as CSSProperties,
    },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignSelf: "stretch",
          flexDirection: "row",
          alignItems: "center",
          flexShrink: 1,
          minWidth: 0,
          minHeight: 64,
        } as CSSProperties,
      },
      <WnaPressable
        ripple={"light"}
        onPress={onPress}
        style={{
          borderRadius: appLayout.globalCornerRadius,
          overflow: "hidden",
          outlineColor: convertHexToRgba(appColors.staticWhite, 0.5),
          outlineOffset: 2,
          height: appLayout.headerButtonHeight,
        }}
        baseStyle={{
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
        }}
      >
        {React.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignSelf: "stretch",
              flexDirection: "row",
              alignItems: "center",
              flexShrink: 1,
              minWidth: 0,
              paddingInline: 8,
            } as CSSProperties,
          },
          showLogo ? (
            <WnaImage
              imageUrl={"/logo_96.webp"}
              imageTitle={altText}
              appColors={appColors}
              style={{
                width: logoSize,
                height: logoSize,
                borderRadius: logoCornerRadius,
              }}
              hideBackground
              contentFit="contain"
            />
          ) : null,
          subTitle === ""
            ? React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    height: 64,
                    boxSizing: "border-box",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 8,
                    paddingLeft: showLogo ? 16 : 8,
                  } as CSSProperties,
                },
                React.createElement(
                  "span",
                  {
                    style: {
                      ...appStyle.textTitleLarge,
                      ...textStyle,
                      fontSize: isLandscape ? 20 : 16,
                      ...lineClampStyle(1),
                    } as CSSProperties,
                  },
                  mainTitle,
                ),
              )
            : React.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    padding: 8,
                    boxSizing: "border-box",
                    flexShrink: 1,
                    minWidth: 0,
                    height: appLayout.headerButtonHeight,
                    justifyContent: "center",
                  } as CSSProperties,
                },
                React.createElement(
                  "span",
                  {
                    style: {
                      ...appStyle.textSmall,
                      ...textStyle,
                      ...lineClampStyle(1),
                    } as CSSProperties,
                  },
                  mainTitle,
                ),
                React.createElement(
                  "span",
                  {
                    style: {
                      ...appStyle.textSmall,
                      ...textStyle,
                      ...lineClampStyle(1),
                    } as CSSProperties,
                  },
                  subTitle,
                ),
              ),
        )}
      </WnaPressable>,
    ),
  );
}

const styles = (appColors: Colors) => ({
  text: {
    flexShrink: 1,
    color: appColors.staticWhite,
  } satisfies CSSProperties,
});
