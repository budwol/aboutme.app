import WnaImage from "@components/images/WnaImage";
import { getAvatarImageSources } from "@components/images/wnaAvatarImageResolver";
import WnaAccentBar from "@components/display/WnaAccentBar";
import WnaSectionTitle from "@components/text/WnaSectionTitle";
import { WnaSectionProps } from "@components/sections/wnaSectionProps";
import { appLayoutConstants } from "@constants/layoutConstants";
import { sectionConstants } from "@constants/sectionConstants";
import Colors from "@constants/theme/colors";
import { i18nKeys } from "@/i18n/i18nKeys";
import { convertHexToRgba } from "@utils/colorConverter";
import { lineClampStyle } from "@utils/lineClampStyle";
import React, { CSSProperties, useEffect, useRef } from "react";

type WebStyleTarget = {
  style?: {
    setProperty: (property: string, value: string) => void;
  };
};

export function applyHeroShapeWebStyles(
  target: WebStyleTarget | null,
  variables: Record<string, string>,
) {
  if (typeof target?.style?.setProperty !== "function") return;

  Object.entries(variables).forEach(([property, value]) => {
    target.style?.setProperty(property, value);
  });
}

type HeroShape = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  width: number;
  height: number;
  radius: number;
  borderColorOpacity: number;
  backgroundOpacity: number;
  accent?: boolean;
  white?: boolean;
  rotate: number;
  swing: 1 | -1;
  animated?: boolean;
};

const heroShapes: HeroShape[] = [
  {
    top: 18,
    left: 18,
    width: 92,
    height: 92,
    radius: 46,
    borderColorOpacity: 0.2,
    backgroundOpacity: 0.07,
    accent: true,
    rotate: -4,
    swing: 1,
    animated: true,
  },
  {
    top: 62,
    right: 8,
    width: 132,
    height: 132,
    radius: 66,
    borderColorOpacity: 0.24,
    backgroundOpacity: 0.06,
    rotate: 10,
    swing: -1,
    animated: true,
  },
  {
    top: 34,
    right: 54,
    width: 56,
    height: 56,
    radius: 28,
    borderColorOpacity: 0.22,
    backgroundOpacity: 0.09,
    accent: true,
    rotate: 3,
    swing: 1,
    animated: true,
  },
  {
    top: 118,
    left: 12,
    width: 72,
    height: 72,
    radius: 36,
    borderColorOpacity: 0.2,
    backgroundOpacity: 0.16,
    white: true,
    rotate: 0,
    swing: -1,
  },
  {
    top: 168,
    right: 26,
    width: 84,
    height: 84,
    radius: 42,
    borderColorOpacity: 0.18,
    backgroundOpacity: 0.04,
    rotate: -8,
    swing: 1,
  },
  {
    bottom: 18,
    left: 24,
    width: 64,
    height: 64,
    radius: 32,
    borderColorOpacity: 0.16,
    backgroundOpacity: 0.05,
    accent: true,
    rotate: 6,
    swing: -1,
  },
  {
    bottom: 42,
    right: 82,
    width: 44,
    height: 44,
    radius: 22,
    borderColorOpacity: 0.18,
    backgroundOpacity: 0.16,
    white: true,
    rotate: -2,
    swing: 1,
  },
  {
    top: 92,
    left: 146,
    width: 38,
    height: 38,
    radius: 19,
    borderColorOpacity: 0.18,
    backgroundOpacity: 0.08,
    accent: true,
    rotate: 8,
    swing: -1,
  },
  {
    top: 196,
    left: 84,
    width: 112,
    height: 112,
    radius: 56,
    borderColorOpacity: 0.16,
    backgroundOpacity: 0.04,
    rotate: -6,
    swing: 1,
  },
  {
    top: 22,
    right: 132,
    width: 74,
    height: 74,
    radius: 37,
    borderColorOpacity: 0.18,
    backgroundOpacity: 0.05,
    rotate: 14,
    swing: -1,
  },
  {
    top: 12,
    left: 108,
    width: 34,
    height: 34,
    radius: 17,
    borderColorOpacity: 0.14,
    backgroundOpacity: 0.05,
    accent: true,
    rotate: -10,
    swing: 1,
  },
  {
    top: 54,
    left: 214,
    width: 52,
    height: 52,
    radius: 26,
    borderColorOpacity: 0.16,
    backgroundOpacity: 0.04,
    rotate: 4,
    swing: -1,
  },
  {
    top: 94,
    right: 178,
    width: 26,
    height: 26,
    radius: 13,
    borderColorOpacity: 0.18,
    backgroundOpacity: 0.08,
    accent: true,
    rotate: 12,
    swing: 1,
    animated: true,
  },
  {
    top: 132,
    left: 86,
    width: 118,
    height: 118,
    radius: 59,
    borderColorOpacity: 0.12,
    backgroundOpacity: 0.03,
    white: true,
    rotate: -3,
    swing: -1,
  },
  {
    top: 156,
    right: 118,
    width: 58,
    height: 58,
    radius: 29,
    borderColorOpacity: 0.16,
    backgroundOpacity: 0.05,
    rotate: 8,
    swing: 1,
  },
  {
    top: 188,
    left: 18,
    width: 30,
    height: 30,
    radius: 15,
    borderColorOpacity: 0.16,
    backgroundOpacity: 0.07,
    accent: true,
    rotate: -6,
    swing: -1,
  },
  {
    bottom: 18,
    left: 102,
    width: 42,
    height: 42,
    radius: 21,
    borderColorOpacity: 0.14,
    backgroundOpacity: 0.05,
    rotate: 5,
    swing: 1,
  },
  {
    bottom: 26,
    right: 18,
    width: 88,
    height: 88,
    radius: 44,
    borderColorOpacity: 0.14,
    backgroundOpacity: 0.03,
    white: true,
    rotate: -10,
    swing: -1,
  },
  {
    bottom: 82,
    right: 148,
    width: 24,
    height: 24,
    radius: 12,
    borderColorOpacity: 0.16,
    backgroundOpacity: 0.08,
    accent: true,
    rotate: 6,
    swing: 1,
    animated: true,
  },
  {
    bottom: 108,
    left: 176,
    width: 66,
    height: 66,
    radius: 33,
    borderColorOpacity: 0.15,
    backgroundOpacity: 0.04,
    rotate: -7,
    swing: -1,
  },
];

function WnaHeroShape({
  shape,
  index,
  appColors,
}: {
  shape: HeroShape;
  index: number;
  appColors: Colors;
}) {
  const shapeRef = useRef<HTMLDivElement>(null);
  const startScale = shape.swing === 1 ? 0.96 : 1.04;
  const endScale = shape.swing === 1 ? 1.04 : 0.96;
  const startOpacity = shape.swing === 1 ? 0.5 : 0.8;
  const endOpacity = shape.swing === 1 ? 0.82 : 0.52;
  const startRotate = shape.rotate - 2.5 * shape.swing;
  const endRotate = shape.rotate + 2.5 * shape.swing;
  const startTranslateX = -4 * shape.swing;
  const endTranslateX = 4 * shape.swing;
  const startTranslateY = 3 * shape.swing;
  const endTranslateY = -3 * shape.swing;

  const animatedStyle = shape.animated
    ? ({
        "--wna-hero-shape-duration": `${sectionConstants.heroFieldMotionDuration}ms`,
        "--wna-hero-shape-start-scale": startScale,
        "--wna-hero-shape-end-scale": endScale,
        "--wna-hero-shape-start-opacity": startOpacity,
        "--wna-hero-shape-end-opacity": endOpacity,
        "--wna-hero-shape-start-rotate": `${startRotate}deg`,
        "--wna-hero-shape-end-rotate": `${endRotate}deg`,
        "--wna-hero-shape-start-x": `${startTranslateX}px`,
        "--wna-hero-shape-end-x": `${endTranslateX}px`,
        "--wna-hero-shape-start-y": `${startTranslateY}px`,
        "--wna-hero-shape-end-y": `${endTranslateY}px`,
        animation: `wna-hero-shape-swing-${
          shape.swing === 1 ? "positive" : "negative"
        } ${sectionConstants.heroFieldMotionDuration}ms ease-in-out infinite alternate`,
      } as CSSProperties)
    : ({
        opacity: 1,
        transform: `rotate(${shape.rotate}deg)`,
      } as CSSProperties);

  useEffect(() => {
    if (!shape.animated) return;

    const variables = {
      "--wna-hero-shape-duration": `${sectionConstants.heroFieldMotionDuration}ms`,
      "--wna-hero-shape-start-scale": String(startScale),
      "--wna-hero-shape-end-scale": String(endScale),
      "--wna-hero-shape-start-opacity": String(startOpacity),
      "--wna-hero-shape-end-opacity": String(endOpacity),
      "--wna-hero-shape-start-rotate": `${startRotate}deg`,
      "--wna-hero-shape-end-rotate": `${endRotate}deg`,
      "--wna-hero-shape-start-x": `${startTranslateX}px`,
      "--wna-hero-shape-end-x": `${endTranslateX}px`,
      "--wna-hero-shape-start-y": `${startTranslateY}px`,
      "--wna-hero-shape-end-y": `${endTranslateY}px`,
    };

    applyHeroShapeWebStyles(shapeRef.current, variables);
  }, [
    endOpacity,
    endScale,
    endTranslateX,
    endTranslateY,
    endRotate,
    shape.animated,
    startOpacity,
    startScale,
    startTranslateX,
    startTranslateY,
    startRotate,
  ]);

  return React.createElement("div", {
    ref: shapeRef,
    id: shape.animated ? `wna-hero-shape-${index}` : undefined,
    ...(shape.animated
      ? {
          className: `wna-hero-shape wna-hero-shape-swing-${
            shape.swing === 1 ? "positive" : "negative"
          }`,
        }
      : {}),
    style: {
      position: "absolute",
      top: shape.top,
      right: shape.right,
      bottom: shape.bottom,
      left: shape.left,
      width: shape.width,
      height: shape.height,
      boxSizing: "border-box",
      borderRadius: shape.radius,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: convertHexToRgba(
        shape.accent ? appColors.accent5 : appColors.coolgray2,
        shape.borderColorOpacity,
      ),
      backgroundColor: convertHexToRgba(
        shape.white
          ? appColors.white
          : shape.accent
            ? appColors.accent5
            : appColors.warmgray6,
        shape.backgroundOpacity,
      ),
      ...animatedStyle,
    } as CSSProperties,
  });
}

type WnaProfileHeroProps = Pick<
  WnaSectionProps,
  "appColors" | "appData" | "appStyle"
> & {
  compact?: boolean;
  imageTitle?: string;
};

export function WnaHeroField({
  appColors,
  compact = false,
}: Pick<WnaSectionProps, "appColors"> & { compact?: boolean }) {
  return React.createElement(
    "div",
    {
      style: {
        ...styles.shapeField,
        ...(compact ? styles.shapeFieldCompact : {}),
      } as CSSProperties,
    },
    heroShapes.map((shape, index) => (
      <WnaHeroShape
        key={`hero-shape-${index}`}
        shape={shape}
        index={index}
        appColors={appColors}
      />
    )),
  );
}

export default function WnaProfileHero({
  appColors,
  appData,
  appStyle,
  compact = false,
  imageTitle = i18nKeys.imageTitleAvatar,
}: WnaProfileHeroProps) {
  const avatarSize = compact
    ? sectionConstants.heroAvatarCompactSize
    : sectionConstants.heroAvatarSize;
  const avatarSources = getAvatarImageSources(
    appData.profile.avatar,
    avatarSize,
  );

  return React.createElement(
    "div",
    {
      style: {
        ...styles.heroCard,
        backgroundColor: convertHexToRgba(appColors.warmgray6, 0.08),
        borderColor: convertHexToRgba(appColors.coolgray2, 0.52),
        ...(compact ? styles.heroCardCompact : {}),
      } as CSSProperties,
    },
    <WnaHeroField appColors={appColors} compact={compact} />,
    React.createElement(
      "div",
      {
        style: {
          ...styles.avatarWrap,
          height: avatarSize,
          marginTop: compact ? 0 : sectionConstants.heroAvatarMarginTop,
        } as CSSProperties,
      },
      <WnaImage
        appColors={appColors}
        imageUrl={`images/${appData.profile.avatar}`}
        imageTitle={imageTitle}
        sources={avatarSources}
        priority={compact ? "normal" : "high"}
        responsivePolicy="static"
        style={{
          width: avatarSize,
          height: avatarSize,
          boxSizing: "border-box",
          borderRadius: avatarSize / 2,
          backgroundColor: appColors.white,
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: appColors.coolgray2,
        }}
      />,
    ),
    compact ? (
      React.createElement(
        "div",
        { style: styles.compactCopy },
        React.createElement(
          "span",
          {
            style: {
              ...styles.compactTitle,
              color: appColors.coolgray8,
              fontFamily: appStyle.textExtraLarge.fontFamily,
              ...lineClampStyle(1),
            } as CSSProperties,
          },
          appData.profile.name,
        ),
        <WnaAccentBar
          appColors={appColors}
          width={sectionConstants.heroAccentBarWidth}
          pulseToWidth={sectionConstants.heroAccentBarPulseWidth}
          pulseDuration={sectionConstants.heroAccentBarPulseDuration}
        />,
        React.createElement(
          "span",
          {
            style: {
              ...styles.compactSubtitle,
              color: appColors.coolgray6,
              fontFamily: appStyle.textMicro.fontFamily,
              ...lineClampStyle(1),
            } as CSSProperties,
          },
          appData.profile.title.toUpperCase(),
        ),
      )
    ) : (
      <WnaSectionTitle
        appColors={appColors}
        appStyle={appStyle}
        title={appData.profile.name}
        subtitle={appData.profile.title.toUpperCase()}
        showAccentBar
        accentBarWidth={sectionConstants.heroAccentBarWidth}
        accentBarPulseToWidth={sectionConstants.heroAccentBarPulseWidth}
        accentBarPulseDuration={sectionConstants.heroAccentBarPulseDuration}
      />
    ),
  );
}

const styles = {
  shapeField: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  shapeFieldCompact: {
    overflow: "hidden",
  },
  heroCard: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    gap: 16,
    padding: 18,
    borderRadius: appLayoutConstants.globalCornerRadius,
    borderWidth: 1,
    borderStyle: "solid",
  },
  heroCardCompact: {
    width: 320,
    maxWidth: "86%",
    paddingBlock: 20,
    paddingInline: 18,
    gap: 14,
  },
  avatarWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  compactCopy: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  compactTitle: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  compactSubtitle: {
    fontSize: 11,
    letterSpacing: 2.2,
    textAlign: "center",
  },
} satisfies Record<string, CSSProperties>;
