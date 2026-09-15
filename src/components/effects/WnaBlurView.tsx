import { StaticColors } from "@constants/theme/staticColors";
import { convertHexToRgba } from "@utils/colorConverter";
import type { CSSProperties, ReactNode } from "react";

export type BlurTint =
  | "dark"
  | "light"
  | "default"
  | "extraLight"
  | "systemThickMaterial";

export type WnaBlurViewProps = {
  style?:
    | CSSProperties
    | (CSSProperties | null | undefined)[]
    | null
    | undefined;
  blurIntensity?: number;
  blurTint: BlurTint;
  backgroundColor?: string;
  backgroundOpacity?: number;
  children?: ReactNode;
  forceExperimentalBlur?: boolean;
  isBackground?: boolean;
};

export function WnaBlurView(props: WnaBlurViewProps) {
  const tint = props.blurTint ?? "dark";
  const normalizedTint = tint.toLowerCase();
  let backgroundColor = "transparent";
  if (props.isBackground) backgroundColor = StaticColors.staticBlack;

  if (!props.forceExperimentalBlur)
    backgroundColor =
      tint === "dark" ? StaticColors.staticBlack : StaticColors.staticWhite;

  if (props.backgroundColor) backgroundColor = props.backgroundColor;

  const backgroundOpacity =
    props.backgroundOpacity ??
    (normalizedTint.includes("dark") || normalizedTint.includes("default")
      ? 0.5
      : 0.8);

  const intensity = props.blurIntensity ?? 30;

  const renderInnerView = (props: WnaBlurViewProps) => {
    return (
      <div
        style={{
          ...webViewStyle,
          ...flattenStyle(props.style),
          backgroundColor: convertHexToRgba(backgroundColor, backgroundOpacity),
        }}
      >
        {props.children}
      </div>
    );
  };

  // Expo intensity is a 0-100 scale; CSS blur uses a pixel radius.
  const cssBlurRadius = Math.min(8, Math.max(0, intensity / 5));
  const blurStyle = props.forceExperimentalBlur
    ? ({
        backdropFilter: `blur(${cssBlurRadius}px)`,
        WebkitBackdropFilter: `blur(${cssBlurRadius}px)`,
      } as CSSProperties)
    : null;

  return props.forceExperimentalBlur ? (
    <div
      style={{ ...webViewStyle, ...flattenStyle(props.style), ...blurStyle }}
    >
      {renderInnerView(props)}
    </div>
  ) : (
    renderInnerView(props)
  );
}

const webViewStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

function flattenStyle(style: WnaBlurViewProps["style"]): CSSProperties {
  if (!Array.isArray(style)) return (style ?? {}) as CSSProperties;
  return style.reduce<CSSProperties>(
    (result, entry) => Object.assign(result, flattenStyle(entry)),
    {},
  );
}
