import Colors from "@constants/theme/colors";
import { createShadowStyle } from "@components/effects/wnaShadowStyle";
import { CSSProperties, useEffect, useRef, useState } from "react";

type WebStyleTarget = {
  style?: {
    setProperty: (property: string, value: string) => void;
  };
};

export function applyAccentBarWebStyles(
  target: WebStyleTarget | null,
  pulseScale: number,
  duration: string,
) {
  if (typeof target?.style?.setProperty !== "function") return;

  target.style.setProperty("--wna-accent-bar-pulse-scale", String(pulseScale));
  target.style.setProperty("--wna-accent-bar-duration", duration);
}

type WnaAccentBarProps = {
  appColors: Colors;
  animated?: boolean;
  width?: number;
  pulseToWidth?: number;
  pulseDuration?: number;
};

function useWnaAccentBarAnimation(
  width: number,
  animated: boolean,
  pulseToWidth: number | undefined,
  pulseDuration: number,
) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animated || pulseToWidth !== undefined) {
      setIsCollapsed(false);
      return;
    }

    // A single requestAnimationFrame (or none at all) can land in the same
    // paint as the initial mount, so the browser never actually renders the
    // full-width starting frame before it's already collapsed -- the CSS
    // transition then has nothing to interpolate from and the bar just
    // snaps straight to its collapsed width instead of animating there.
    // Two nested rAFs guarantee a real paint of the starting state first,
    // same trick WnaApp.tsx uses for its own reveal/transition timings.
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = requestAnimationFrame(() => {
        setIsCollapsed(true);
      });
    });

    return () => {
      /* istanbul ignore else -- frameRef.current is assigned synchronously by the requestAnimationFrame call above in the same effect run that registers this cleanup, so it can never be null when the cleanup runs */
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [animated, pulseToWidth, width]);

  if (pulseToWidth !== undefined) {
    return {
      "--wna-accent-bar-pulse-scale": pulseToWidth / width,
      "--wna-accent-bar-duration": `${pulseDuration * 2}ms`,
      animation: `wna-accent-bar-pulse${
        width === 112 && pulseToWidth === 24 ? "-hero" : ""
      } ${pulseDuration * 2}ms ease-in-out infinite alternate`,
    } as CSSProperties;
  }

  return {
    width: isCollapsed ? 8 : width,
    transition: animated
      ? "width 820ms cubic-bezier(0.33, 1, 0.68, 1)"
      : undefined,
  } as CSSProperties;
}

export default function WnaAccentBar({
  appColors,
  animated = false,
  width = 220,
  pulseToWidth,
  pulseDuration = 3600,
}: WnaAccentBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const barAnimatedStyle = useWnaAccentBarAnimation(
    width,
    animated,
    pulseToWidth,
    pulseDuration,
  );

  useEffect(() => {
    if (pulseToWidth === undefined) return;

    const target = barRef.current as unknown as WebStyleTarget | null;
    applyAccentBarWebStyles(
      target,
      pulseToWidth / width,
      `${pulseDuration * 2}ms`,
    );
  }, [pulseDuration, pulseToWidth, width]);

  return (
    <div style={{ ...styles.row, width }}>
      <div
        ref={barRef}
        {...(pulseToWidth !== undefined
          ? {
              className:
                width === 112 && pulseToWidth === 24
                  ? "wna-accent-bar-pulse-hero"
                  : "wna-accent-bar-pulse",
            }
          : {})}
        style={
          {
            ...styles.bar,
            backgroundColor: String(appColors.accent5),
            ...createShadowStyle(2.25, String(appColors.accent5)),
            ...barAnimatedStyle,
          } as CSSProperties
        }
      />
    </div>
  );
}

const styles: { row: CSSProperties; bar: CSSProperties } = {
  row: {
    display: "flex",
    flexDirection: "column",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
    marginRight: "auto",
  },
  bar: {
    width: 220,
    height: 8,
    borderRadius: 999,
  },
};
