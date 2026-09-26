import Colors from "@constants/theme/colors";
import { convertHexToRgba } from "@utils/colorConverter";
import { appMotionConstants } from "@constants/motionConstants";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { subscribeWnaToast, WnaToast } from "@components/feedback/wnaToast";

const { toastDisplayDuration, toastEnterDuration, toastExitDuration } =
  appMotionConstants;

// "entering" is a single frame at the hidden style, so the browser has a
// start value to transition from before switching to "shown".
type ToastPhase = "entering" | "shown" | "leaving";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

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
        boxSizing: "border-box",
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
  const [phase, setPhase] = useState<ToastPhase>("entering");
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const removeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      if (removeTimeoutRef.current) {
        clearTimeout(removeTimeoutRef.current);
        removeTimeoutRef.current = null;
      }
    };

    const unsubscribe = subscribeWnaToast((nextToast) => {
      clearTimers();

      setToast(nextToast);
      // A toast arriving while one is already fully shown (e.g. toggling
      // the theme twice quickly) just swaps its content in place; one
      // arriving while hidden or mid-fade-out animates in again.
      setPhase((current) => (current === "shown" ? "shown" : "entering"));
      hideTimeoutRef.current = setTimeout(() => {
        hideTimeoutRef.current = null;
        setPhase("leaving");
        removeTimeoutRef.current = setTimeout(() => {
          removeTimeoutRef.current = null;
          setToast(null);
        }, toastExitDuration);
      }, toastDisplayDuration);
    });

    return () => {
      unsubscribe();
      clearTimers();
    };
  }, []);

  useEffect(() => {
    if (toast && phase === "entering") {
      // Forces a style flush at the hidden start values; without it the
      // browser may batch both states into one frame and skip the
      // transition entirely.
      hostRef.current?.getBoundingClientRect();
      setPhase("shown");
    }
  }, [toast, phase]);

  if (!toast) {
    return null;
  }

  const isShown = phase === "shown";
  const hiddenTransform = prefersReducedMotion()
    ? "none"
    : "translateY(-16px) scale(0.98)";

  return React.createElement(
    "div",
    {
      ref: hostRef,
      style: {
        ...styles.host,
        pointerEvents: "none",
        opacity: isShown ? 1 : 0,
        transform: isShown ? "none" : hiddenTransform,
        transition: isShown
          ? `opacity ${toastEnterDuration}ms ease-out, transform ${toastEnterDuration}ms ease-out`
          : `opacity ${toastExitDuration}ms ease-in, transform ${toastExitDuration}ms ease-in`,
      } as CSSProperties,
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
