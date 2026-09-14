import Colors from "@constants/theme/colors";
import { convertHexToRgba } from "@utils/colorConverter";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { subscribeWnaToast, WnaToast } from "@components/feedback/wnaToast";

const toastDuration = 2400;

export function renderWnaToastCard(
  appColors: Colors,
  text1?: string,
  text2?: string,
) {
  const toastShadowColor = appColors.isDark
    ? convertHexToRgba(appColors.staticBlack, 0.24)
    : convertHexToRgba(appColors.staticBlack, 0.12);
  const accentShadowColor = appColors.isDark
    ? convertHexToRgba(appColors.accent5, 0.28)
    : convertHexToRgba(appColors.accent5, 0.18);

  return React.createElement(
    "div",
    {
      style: {
        width: "100%",
        maxWidth: 328,
        minHeight: 78,
        borderRadius: 18,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: appColors.isDark
          ? convertHexToRgba(appColors.coolgray4, 0.3)
          : convertHexToRgba(appColors.coolgray2, 0.78),
        backgroundColor: appColors.isDark
          ? convertHexToRgba(appColors.background, 0.98)
          : convertHexToRgba(appColors.white, 0.98),
        paddingInline: 18,
        paddingBlock: 16,
        boxShadow: `0px 12px 22px ${toastShadowColor}`,
        overflow: "hidden",
      } as CSSProperties,
    },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          gap: 14,
          flex: 1,
        } as CSSProperties,
      },
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            width: 10,
            justifyContent: "center",
            alignItems: "center",
          } as CSSProperties,
        },
        React.createElement("div", {
          style: {
            width: 4,
            alignSelf: "stretch",
            minHeight: 42,
            borderRadius: 999,
            backgroundColor: appColors.accent5,
            boxShadow: `0px 0px 8px ${accentShadowColor}`,
          } as CSSProperties,
        }),
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minWidth: 0,
            justifyContent: "center",
            paddingBlock: 2,
          } as CSSProperties,
        },
        text1
          ? React.createElement(
              "span",
              {
                style: {
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 1.1,
                  textTransform: "uppercase",
                  color: appColors.isDark
                    ? convertHexToRgba(appColors.coolgray8, 0.64)
                    : appColors.coolgray6,
                } as CSSProperties,
              },
              text1,
            )
          : null,
        text2
          ? React.createElement(
              "span",
              {
                style: {
                  marginTop: text1 ? 7 : 0,
                  fontSize: 17,
                  lineHeight: "23px",
                  fontWeight: "700",
                  letterSpacing: 0.15,
                  color: appColors.isDark
                    ? appColors.coolgray8
                    : appColors.black,
                } as CSSProperties,
              },
              text2,
            )
          : null,
      ),
    ),
  );
}

type WnaToastHostProps = {
  appColors: Colors;
};

export default function WnaToastHost({ appColors }: WnaToastHostProps) {
  const [toast, setToast] = useState<WnaToast | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeWnaToast((nextToast) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToast(nextToast);
      timeoutRef.current = setTimeout(() => {
        setToast(null);
        timeoutRef.current = null;
      }, toastDuration);
    });

    return () => {
      unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!toast) {
    return null;
  }

  return React.createElement(
    "div",
    {
      style: { ...styles.host, pointerEvents: "none" } as CSSProperties,
    },
    renderWnaToastCard(
      toast.props?.appColors ?? appColors,
      toast.text1,
      toast.text2,
    ),
  );
}

const styles = {
  host: {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    top: 18,
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 1000,
  },
} satisfies Record<string, CSSProperties>;
